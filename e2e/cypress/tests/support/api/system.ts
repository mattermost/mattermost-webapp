// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import merge from 'deepmerge';

import {AnalyticsRow} from 'mattermost-redux/types/admin';
import {AdminConfig, ClientLicense} from '@mattermost/types/config';
import {DeepPartial} from '@mattermost/types/utilities';

import {Constants} from '../../utils';

import {ChainableT} from './types';

import onPremDefaultConfig from './on_prem_default_config.json';
import cloudDefaultConfig from './cloud_default_config.json';

// *****************************************************************************
// System
// https://api.mattermost.com/#tag/system
// *****************************************************************************

function hasLicenseForFeature(license: ClientLicense, key: string): boolean {
    for (const [k, v] of Object.entries(license)) {
        if (k === key && v === 'true') {
            return true;
        }
    }

    return false;
}

interface FetchedLicense {
    license: ClientLicense;
    isLicensed: boolean;
    isCloudLicensed: boolean;
}

function apiGetClientLicense(): Cypress.Chainable<FetchedLicense> {
    return cy.request('/api/v4/license/client?format=old').then((response) => {
        expect(response.status).to.equal(200);

        const license = response.body;
        const isLicensed = license.IsLicensed === 'true';
        const isCloudLicensed = hasLicenseForFeature(license, 'Cloud');

        return cy.wrap({
            license: response.body,
            isLicensed,
            isCloudLicensed,
        });
    });
}
Cypress.Commands.add('apiGetClientLicense', apiGetClientLicense);

function apiRequireLicenseForFeature(...keys: string[]): Cypress.Chainable<FetchedLicense> {
    Cypress.log({name: 'EE License', message: `Checking if server has license for feature: __${Object.values(keys).join(', ')}__.`});

    return uploadLicenseIfNotExist().then((data) => {
        const {license, isLicensed} = data;
        const hasLicenseMessage = `Server ${isLicensed ? 'has' : 'has no'} EE license.`;
        expect(isLicensed, hasLicenseMessage).to.equal(true);

        Object.values(keys).forEach((key) => {
            const hasLicenseKey = hasLicenseForFeature(license, key);
            const hasLicenseKeyMessage = `Server ${hasLicenseKey ? 'has' : 'has no'} EE license for feature: __${key}__`;
            expect(hasLicenseKey, hasLicenseKeyMessage).to.equal(true);
        });

        return cy.wrap(data);
    });
}
Cypress.Commands.add('apiRequireLicenseForFeature', apiRequireLicenseForFeature);

function apiRequireLicense(): Cypress.Chainable<FetchedLicense> {
    Cypress.log({name: 'EE License', message: 'Checking if server has license.'});

    return uploadLicenseIfNotExist().then((data) => {
        const hasLicenseMessage = `Server ${data.isLicensed ? 'has' : 'has no'} EE license.`;
        expect(data.isLicensed, hasLicenseMessage).to.equal(true);

        return cy.wrap(data);
    });
}
Cypress.Commands.add('apiRequireLicense', apiRequireLicense);

function apiUploadLicense(filePath: string): Cypress.Chainable<Response> {
    return cy.apiUploadFile('license', filePath, {url: '/api/v4/license', method: 'POST', successStatus: 200});
}
Cypress.Commands.add('apiUploadLicense', apiUploadLicense);

function apiInstallTrialLicense(): Cypress.Chainable<ClientLicense> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/trial-license',
        method: 'POST',
        body: {
            trialreceive_emails_accepted: true,
            terms_accepted: true,
            users: Cypress.env('numberOfTrialUsers'),
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(Promise.resolve(response.body));
    });
}
Cypress.Commands.add('apiInstallTrialLicense', apiInstallTrialLicense);

function apiDeleteLicense(): Cypress.Chainable<{response: Cypress.Response<any>}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/license',
        method: 'DELETE',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({response});
    });
}

Cypress.Commands.add('apiDeleteLicense', apiDeleteLicense);

export const getDefaultConfig = () => {
    const cypressEnv = Cypress.env();

    const fromCypressEnv: DeepPartial<AdminConfig> = {
        ElasticsearchSettings: {
            ConnectionURL: cypressEnv.elasticsearchConnectionURL,
        },
        LdapSettings: {
            LdapServer: cypressEnv.ldapServer,
            LdapPort: cypressEnv.ldapPort,
        },
        ServiceSettings: {
            AllowedUntrustedInternalConnections: cypressEnv.allowedUntrustedInternalConnections,
            SiteURL: Cypress.config('baseUrl'),
        },
    };

    const isCloud = cypressEnv.serverEdition === Constants.ServerEdition.CLOUD;

    if (isCloud) {
        (fromCypressEnv as DeepPartial<AdminConfig> & {CloudSettings: Record<string, string>}).CloudSettings = {
            CWSURL: cypressEnv.cwsURL,
            CWSAPIURL: cypressEnv.cwsAPIURL,
        };
    }

    const defaultConfig: AdminConfig = isCloud ? cloudDefaultConfig as unknown as AdminConfig : onPremDefaultConfig as unknown as AdminConfig;

    return merge<AdminConfig>(defaultConfig, fromCypressEnv as Partial<AdminConfig>);
};

const expectConfigToBeUpdatable = (currentConfig: AdminConfig, newConfig: Partial<AdminConfig>) => {
    function errorMessage(name: string) {
        return `${name} is restricted or not available to update. You may check user/sysadmin access, license requirement, server version or edition (on-prem/cloud) compatibility.`;
    }

    Object.entries(newConfig).forEach(([newMainKey, newSubSetting]) => {
        const setting = currentConfig[newMainKey];

        if (setting) {
            Object.keys(newSubSetting).forEach((newSubKey) => {
                const isAvailable = setting.hasOwnProperty(newSubKey);
                const name = `${newMainKey}.${newSubKey}`;
                expect(isAvailable, isAvailable ? `${name} setting can be updated.` : errorMessage(name)).to.equal(true);
            });
        } else {
            const withSetting = Boolean(setting);
            expect(withSetting, withSetting ? `${newMainKey} setting can be updated.` : errorMessage(newMainKey)).to.equal(true);
        }
    });
};

function apiUpdateConfig(newConfig: Partial<AdminConfig> = {}): ReturnType<typeof apiGetConfig> {
    // # Get current config
    return cy.apiGetConfig().then(({config: currentConfig}: {config: AdminConfig}) => {
        // * Check if config can be updated
        expectConfigToBeUpdatable(currentConfig, newConfig);

        const config = merge.all([currentConfig, getDefaultConfig(), newConfig]);

        // # Set the modified config
        return cy.request({
            url: '/api/v4/config',
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            method: 'PUT',
            body: config,
        }).then((updateResponse) => {
            expect(updateResponse.status).to.equal(200);
            return cy.apiGetConfig();
        });
    });
}

Cypress.Commands.add('apiUpdateConfig', apiUpdateConfig);

function apiReloadConfig(): ReturnType<typeof apiGetConfig> {
    // # Reload the config
    return cy.request({
        url: '/api/v4/config/reload',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
    }).then((reloadResponse) => {
        expect(reloadResponse.status).to.equal(200);
        return cy.apiGetConfig();
    });
}
Cypress.Commands.add('apiReloadConfig', apiReloadConfig);

function apiGetConfig(old?: boolean): Cypress.Chainable<{config: AdminConfig}> {
    // # Get current settings
    return cy.request(`/api/v4/config${old ? '/client?format=old' : ''}`).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({config: response.body});
    });
}

Cypress.Commands.add('apiGetConfig', apiGetConfig);

function apiGetAnalytics(): ChainableT<{analytics: AnalyticsRow[]}> {
    cy.apiAdminLogin();

    return cy.request('/api/v4/analytics/old').then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({analytics: response.body});
    });
}
Cypress.Commands.add('apiGetAnalytics', apiGetAnalytics);

function apiInvalidateCache(): ChainableT<any> {
    return cy.request({
        url: '/api/v4/caches/invalidate',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiInvalidateCache', apiInvalidateCache);

function isCloudEdition() {
    return cy.apiGetClientLicense().then(({isCloudLicensed}) => {
        return cy.wrap(isCloudLicensed);
    });
}

function shouldNotRunOnCloudEdition() {
    isCloudEdition().then((isCloud) => {
        expect(isCloud, isCloud ? 'Should not run on Cloud server' : '').to.equal(false);
    });
}
Cypress.Commands.add('shouldNotRunOnCloudEdition', shouldNotRunOnCloudEdition);

function isTeamEdition() {
    return cy.apiGetClientLicense().then(({isLicensed}) => {
        return cy.wrap(!isLicensed);
    });
}

function shouldRunOnTeamEdition() {
    isTeamEdition().then((isTeam) => {
        expect(isTeam, isTeam ? '' : 'Should run on Team edition only').to.equal(true);
    });
}
Cypress.Commands.add('shouldRunOnTeamEdition', shouldRunOnTeamEdition);

function isElasticsearchEnabled() {
    return cy.apiGetConfig().then(({config}) => {
        let isEnabled = false;

        if (config.ElasticsearchSettings) {
            const {EnableAutocomplete, EnableIndexing, EnableSearching} = config.ElasticsearchSettings;

            isEnabled = EnableAutocomplete && EnableIndexing && EnableSearching;
        }

        return cy.wrap(isEnabled);
    });
}

Cypress.Commands.add('shouldHaveElasticsearchDisabled', () => {
    isElasticsearchEnabled().then((data) => {
        expect(data, data ? 'Should have Elasticsearch disabled' : '').to.equal(false);
    });
});

function shouldHavePluginUploadEnabled() {
    return cy.apiGetConfig().then(({config}) => {
        const isUploadEnabled = config.PluginSettings.EnableUploads;
        expect(isUploadEnabled, isUploadEnabled ? '' : 'Should have Plugin upload enabled').to.equal(true);
    });
}
Cypress.Commands.add('shouldHavePluginUploadEnabled', shouldHavePluginUploadEnabled);

function shouldRunWithSubpath() {
    return cy.apiGetConfig().then(({config}) => {
        const isSubpath = Boolean(config.ServiceSettings.SiteURL.replace(/^https?:\/\//, '').split('/')[1]);
        expect(isSubpath, isSubpath ? '' : 'Should run on server running with subpath only').to.equal(true);
    });
}
Cypress.Commands.add('shouldRunWithSubpath', shouldRunWithSubpath);

function shouldHaveFeatureFlag(key: string, expectedValue: string) {
    return cy.apiGetConfig().then(({config}) => {
        const actualValue = config.FeatureFlags[key];
        const message = actualValue === expectedValue ?
            `Matches feature flag - "${key}: ${expectedValue}"` :
            `Expected feature flag "${key}" to be "${expectedValue}", but was "${actualValue}"`;
        expect(actualValue, message).to.equal(expectedValue);
    });
}
Cypress.Commands.add('shouldHaveFeatureFlag', shouldHaveFeatureFlag);

function shouldHaveEmailEnabled(): Cypress.Chainable<any> {
    return cy.apiGetConfig().then(({config}) => {
        if (!config.ExperimentalSettings.RestrictSystemAdmin) {
            cy.apiEmailTest();
        }
    });
}

Cypress.Commands.add('shouldHaveEmailEnabled', shouldHaveEmailEnabled);

/**
 * Upload a license if it does not exist.
 */
function uploadLicenseIfNotExist(): Cypress.Chainable<FetchedLicense> {
    return cy.apiGetClientLicense().then((data: FetchedLicense) => {
        if (data.isLicensed) {
            return cy.wrap(data);
        }

        return cy.apiInstallTrialLicense().then(() => {
            return cy.apiGetClientLicense();
        });
    });
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Get configuration.
             * See https://api.mattermost.com/#tag/system/paths/~1config/get
             * @returns {AdminConfig} `out.config` as `AdminConfig`
             *
             * @example
             *   cy.apiGetConfig().then(({config}) => {
             *       // do something with config
             *   });
             */
            apiGetConfig: typeof apiGetConfig;

            /**
             * Update configuration, returning the new value of the config.
             * See https://api.mattermost.com/#tag/system/paths/~1config/put
             * @param {Partial<AdminConfig>} newConfig - new config
             * @returns {AdminConfig} `out.config` as `AdminConfig`
             *
             * @example
             *   cy.apiUpdateConfig().then(({config}) => {
             *       // do something with config
             *   });
             */
            apiUpdateConfig: typeof apiUpdateConfig;

            /**
             * Get a subset of the server license needed by the client.
             * See https://api.mattermost.com/#tag/system/paths/~1license~1client/get
             *
             * @example
             *   cy.apiGetClientLicense().then(({license}) => {
             *       // do something with license
             *   });
             */
            apiGetClientLicense: typeof apiGetClientLicense;

            /**
             * Verify if server has license for a certain feature and fail test if not found.
             * Upload a license if it does not exist.
             * @param {string[]} ...keys - accepts multiple arguments of features to check, e.g. 'LDAP'
             * @returns {FetchedLicense}
             *
             * @example
             *   cy.apiRequireLicenseForFeature('LDAP');
            *    cy.apiRequireLicenseForFeature('LDAP', 'SAML');
             */
            apiRequireLicenseForFeature: typeof apiRequireLicenseForFeature;

            /**
             * Verify if server has license and fail test if not found.
             * Upload a license if it does not exist.
             * @returns {FetchedLicense}
             *
             * @example
             *   cy.apiRequireLicense();
             */
            apiRequireLicense(): typeof apiRequireLicense;

            /**
             * Upload a license to enable enterprise features.
             * See https://api.mattermost.com/#tag/system/paths/~1license/post
             * @param {String} filePath - path of the license file relative to fixtures folder
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   const filePath = 'mattermost-license.txt';
             *   cy.apiUploadLicense(filePath);
             */
            apiUploadLicense: typeof apiUploadLicense;

            /**
             * Request and install a trial license for your server.
             * See https://api.mattermost.com/#tag/system/paths/~1trial-license/post
             *
             * @example
             *   cy.apiInstallTrialLicense();
             */
            apiInstallTrialLicense: typeof apiInstallTrialLicense;

            /**
             * Remove the license file from the server. This will disable all enterprise features.
             * See https://api.mattermost.com/#tag/system/paths/~1license/delete
             * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
             *
             * @example
             *   cy.apiDeleteLicense();
             */
            apiDeleteLicense(): typeof apiDeleteLicense;

            /**
             * Require email service to be reachable by the server
             * thru "/api/v4/email/test" if sysadmin account has
             * permission to do so. Otherwise, skip email test.
             *
             * @example
             *   cy.shouldHaveEmailEnabled();
             */
            shouldHaveEmailEnabled: typeof shouldHaveEmailEnabled;

            /**
             * Reload the configuration file to pick up on any changes made to it.
             * See https://api.mattermost.com/#tag/system/paths/~1config~1reload/post
             * @returns {AdminConfig} `out.config` as `AdminConfig`
             *
             * @example
             *   cy.apiReloadConfig().then(({config}) => {
             *       // do something with config
             *   });
             */
            apiReloadConfig: typeof apiReloadConfig;

            /**
             * Get analytics.
             * See https://api.mattermost.com/#tag/system/paths/~1analytics~1old/get
             * @returns {AnalyticsRow[]} `out.analytics` as `AnalyticsRow[]`
             *
             * @example
             *   cy.apiGetAnalytics().then(({analytics}) => {
             *       // do something with analytics
             *   });
             */
            apiGetAnalytics: typeof apiGetAnalytics;

            /**
             * Invalidate all the caches.
             * See https://api.mattermost.com/#tag/system/paths/~1caches~1invalidate/post
             * @returns {Object} `out.data` as response status
             *
             * @example
             *   cy.apiInvalidateCache();
             */
            apiInvalidateCache: typeof apiInvalidateCache;

            /**
             * Allow test for server other than Cloud edition or with Cloud license.
             * Otherwise, fail fast.
             * @example
             *   cy.shouldNotRunOnCloudEdition();
             */
            shouldNotRunOnCloudEdition: typeof shouldNotRunOnCloudEdition;

            /**
             * Allow test for server on Team edition or without license.
             * Otherwise, fail fast.
             * @example
             *   cy.shouldRunOnTeamEdition();
             */
            shouldRunOnTeamEdition: typeof shouldRunOnTeamEdition;

            /**
             * Allow test for server with Plugin upload enabled.
             * Otherwise, fail fast.
             * @example
             *   cy.shouldHavePluginUploadEnabled();
             */
            shouldHavePluginUploadEnabled: typeof shouldHavePluginUploadEnabled;

            /**
             * Allow test for server running with subpath.
             * Otherwise, fail fast.
             * @example
             *   cy.shouldRunWithSubpath();
             */
            shouldRunWithSubpath: typeof shouldRunWithSubpath;

            /**
             * Allow test if matches feature flag setting
             * Otherwise, fail fast.
             *
             * @param {string} feature - feature name
             * @param {string} expectedValue - expected value
             *
             * @example
             *   cy.shouldHaveFeatureFlag('feature', 'expected-value');
             */
            shouldHaveFeatureFlag: typeof shouldHaveFeatureFlag;
        }
    }
}
