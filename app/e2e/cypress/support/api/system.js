// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import merge from 'deepmerge';

import partialDefaultConfig from '../../fixtures/partial_default_config.json';

// *****************************************************************************
// System
// https://api.mattermost.com/#tag/system
// *****************************************************************************

Cypress.Commands.add('apiGetClientLicense', () => {
    return cy.request('/api/v4/license/client?format=old').then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({license: response.body});
    });
});

Cypress.Commands.add('apiRequireLicenseForFeature', (key = '') => {
    Cypress.log({name: 'EE License', message: `Checking if server has license for feature: __${key}__.`});

    return uploadLicenseIfNotExist().then(({license}) => {
        const hasLicenseMessage = `Server ${license.IsLicensed === 'true' ? 'has' : 'has no'} EE license.`;
        expect(license.IsLicensed, hasLicenseMessage).to.equal('true');

        let hasLicenseKey = false;
        for (const [k, v] of Object.entries(license)) {
            if (k === key && v === 'true') {
                hasLicenseKey = true;
                break;
            }
        }

        const hasLicenseKeyMessage = `Server ${hasLicenseKey ? 'has' : 'has no'} EE license for feature: __${key}__`;
        expect(hasLicenseKey, hasLicenseKeyMessage).to.equal(true);

        return cy.wrap({license});
    });
});

Cypress.Commands.add('apiRequireLicense', () => {
    Cypress.log({name: 'EE License', message: 'Checking if server has license.'});

    return uploadLicenseIfNotExist().then(({license}) => {
        const hasLicenseMessage = `Server ${license.IsLicensed === 'true' ? 'has' : 'has no'} EE license.`;
        expect(license.IsLicensed, hasLicenseMessage).to.equal('true');

        return cy.wrap({license});
    });
});

Cypress.Commands.add('apiUploadLicense', (filePath) => {
    cy.apiUploadFile('license', filePath, {url: '/api/v4/license', method: 'POST', successStatus: 200});
});

Cypress.Commands.add('apiInstallTrialLicense', () => {
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
        return cy.wrap(response.body);
    });
});

Cypress.Commands.add('apiDeleteLicense', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/license',
        method: 'DELETE',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({response});
    });
});

const getDefaultConfig = () => {
    const fromCypressEnv = {
        LdapSettings: {
            LdapServer: Cypress.env('ldapServer'),
            LdapPort: Cypress.env('ldapPort'),
        },
        ServiceSettings: {SiteURL: Cypress.config('baseUrl')},
    };

    return merge(partialDefaultConfig, fromCypressEnv);
};

Cypress.Commands.add('apiUpdateConfig', (newConfig = {}) => {
    // # Get current settings
    return cy.request('/api/v4/config').then((response) => {
        const oldConfig = response.body;

        const config = merge.all([oldConfig, getDefaultConfig(), newConfig]);

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
});

Cypress.Commands.add('apiReloadConfig', () => {
    // # Reload the config
    return cy.request({
        url: '/api/v4/config/reload',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
    }).then((reloadResponse) => {
        expect(reloadResponse.status).to.equal(200);
        return cy.apiGetConfig();
    });
});

Cypress.Commands.add('apiGetConfig', () => {
    // # Get current settings
    return cy.request('/api/v4/config').then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({config: response.body});
    });
});

Cypress.Commands.add('apiGetAnalytics', () => {
    cy.apiAdminLogin();

    return cy.request('/api/v4/analytics/old').then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({analytics: response.body});
    });
});

Cypress.Commands.add('apiInvalidateCache', () => {
    return cy.request({
        url: '/api/v4/caches/invalidate',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'POST',
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

/**
 * Upload a license if it does not exist.
 */
function uploadLicenseIfNotExist() {
    return cy.apiGetClientLicense().then(({license}) => {
        if (license.IsLicensed === 'true') {
            return cy.wrap({license});
        }

        return cy.apiInstallTrialLicense().then(() => {
            return cy.apiGetClientLicense();
        });
    });
}
