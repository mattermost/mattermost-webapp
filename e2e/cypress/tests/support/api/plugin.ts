// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

// *****************************************************************************
// Plugins
// https://api.mattermost.com/#tag/plugins
// *****************************************************************************

import {PluginManifest, PluginsResponse} from '@mattermost/types/plugins';
import {ChainableT, ResponseT} from './types';

function apiGetAllPlugins(): ChainableT<{plugins: PluginsResponse}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/plugins',
        method: 'GET',
        failOnStatusCode: false,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({plugins: response.body});
    });
}
Cypress.Commands.add('apiGetAllPlugins', apiGetAllPlugins);

function getPlugin(plugins: PluginManifest[], pluginId: string, version?: string) {
    return Cypress._.find(plugins, (plugin) => {
        return version ? plugin.id === pluginId && plugin.version === version : plugin.id === pluginId;
    });
}

interface PluginStatus {
    isInstalled: boolean;
    isActive: boolean;
}

interface PluginTestInfo {
    id: string;
    version: string;
    url: string;
    filename: string;
}

function apiGetPluginStatus(pluginId: string, version: string): ChainableT<PluginStatus> {
    return cy.apiGetAllPlugins().then(({plugins}) => {
        const active = getPlugin(plugins.active, pluginId, version);
        const inactive = getPlugin(plugins.inactive, pluginId, version);

        if (active) {
            return cy.wrap({isInstalled: true, isActive: true});
        }

        if (inactive) {
            return cy.wrap({isInstalled: true, isActive: false});
        }

        return cy.wrap({isInstalled: false, isActive: false});
    });
}
Cypress.Commands.add('apiGetPluginStatus', apiGetPluginStatus);

function apiUploadPlugin(filename: string): ChainableT<any> {
    const options = {
        url: '/api/v4/plugins',
        method: 'POST',
        successStatus: 201,
    };
    return cy.apiUploadFile('plugin', filename, options).then(() => {
        return cy.wait(TIMEOUTS.THREE_SEC);
    });
}
Cypress.Commands.add('apiUploadPlugin', apiUploadPlugin);

function apiUploadAndEnablePlugin({filename, url, id, version}): ChainableT<PluginStatus> {
    return cy.apiGetPluginStatus(id, version).then((data) => {
        // # If already active, then only return the data
        if (data.isActive) {
            cy.log(`${id}: Plugin is active.`);
            return cy.wrap(data);
        }

        // # If already installed, then only enable the plugin
        if (data.isInstalled) {
            cy.log(`${id}: Plugin is inactive. Only going to enable.`);
            return cy.apiEnablePluginById(id).then(() => {
                cy.wait(TIMEOUTS.ONE_SEC);
                return cy.wrap(data);
            });
        }

        if (url) {
            // # Upload plugin by URL then enable
            cy.log(`${id}: Plugin is to be uploaded via URL and then enable.`);
            return cy.apiInstallPluginFromUrl(url).then(() => {
                cy.wait(TIMEOUTS.FIVE_SEC);
                return cy.apiEnablePluginById(id).then(() => {
                    cy.wait(TIMEOUTS.ONE_SEC);
                    return cy.wrap({isInstalled: true, isActive: true});
                });
            });
        }

        // # Upload plugin by file then enable
        cy.log(`${id}: Plugin is to be uploaded by filename and then enable.`);
        return cy.apiUploadPlugin(filename).then(() => {
            return cy.apiEnablePluginById(id).then(() => {
                return cy.wrap({isInstalled: true, isActive: true});
            });
        });
    });
}
Cypress.Commands.add('apiUploadAndEnablePlugin', apiUploadAndEnablePlugin);

function apiInstallPluginFromUrl(url: string, force = true): ChainableT<{plugin: PluginManifest}> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/install_from_url?plugin_download_url=${encodeURIComponent(url)}&force=${force}`,
        method: 'POST',
        timeout: TIMEOUTS.TWO_MIN,
        failOnStatusCode: false,
    }).then((response) => {
        expect(response.status).to.equal(201);

        cy.wait(TIMEOUTS.THREE_SEC);
        return cy.wrap({plugin: response.body});
    });
}
Cypress.Commands.add('apiInstallPluginFromUrl', apiInstallPluginFromUrl);

function apiEnablePluginById(pluginId: string): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/${encodeURIComponent(pluginId)}/enable`,
        method: 'POST',
        timeout: TIMEOUTS.TWO_MIN,
        failOnStatusCode: false,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiEnablePluginById', apiEnablePluginById);

function apiDisablePluginById(pluginId: string): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/${encodeURIComponent(pluginId)}/disable`,
        method: 'POST',
        timeout: TIMEOUTS.ONE_MIN,
        failOnStatusCode: false,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiDisablePluginById', apiDisablePluginById);

const prepackagedPlugins = [
    'antivirus',
    'mattermost-autolink',
    'com.mattermost.aws-sns',
    'com.mattermost.plugin-channel-export',
    'com.mattermost.custom-attributes',
    'github',
    'com.github.manland.mattermost-plugin-gitlab',
    'com.mattermost.plugin-incident-management',
    'jenkins',
    'jira',
    'com.mattermost.nps',
    'com.mattermost.welcomebot',
    'zoom',
];

function apiDisableNonPrepackagedPlugins() {
    cy.apiGetAllPlugins().then(({plugins}) => {
        plugins.active.forEach((plugin) => {
            if (!prepackagedPlugins.includes(plugin.id)) {
                cy.apiDisablePluginById(plugin.id);
            }
        });
    });
}
Cypress.Commands.add('apiDisableNonPrepackagedPlugins', apiDisableNonPrepackagedPlugins);

function apiRemovePluginById(pluginId: string): ResponseT<any> {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/${encodeURIComponent(pluginId)}`,
        method: 'DELETE',
        timeout: TIMEOUTS.TWO_MIN,
        failOnStatusCode: false,
    }).then((response) => {
        return cy.wrap(response);
    });
}
Cypress.Commands.add('apiRemovePluginById', apiRemovePluginById);

function apiUninstallAllPlugins() {
    cy.apiGetAllPlugins().then(({plugins}) => {
        const {active, inactive} = plugins;
        inactive.forEach((plugin) => cy.apiRemovePluginById(plugin.id));
        active.forEach((plugin) => cy.apiRemovePluginById(plugin.id));
    });
}
Cypress.Commands.add('apiUninstallAllPlugins', apiUninstallAllPlugins);


declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Get plugins.
             * See https://api.mattermost.com/#tag/plugins/paths/~1plugins/get
             * @returns {PluginsResponse} `out.plugins` as `PluginsResponse`
             *
             * @example
             *   cy.apiGetAllPlugins().then(({plugins}) => {
             *       // do something with plugins
             *   });
             */
            apiGetAllPlugins: typeof apiGetAllPlugins;

            /**
             * Get plugins.
             * @param {string} pluginId - plugin ID
             * @param {string} version - plugin version
             *
             * @returns {PluginStatus} - plugin status if upload and active
             *
             * @example
             *   cy.apiGetPluginStatus(pluginId, version).then((status) => {
             *       // do something with status
             *   });
             */
            apiGetPluginStatus: typeof apiGetPluginStatus;

            /**
             * Upload plugin.
             * See https://api.mattermost.com/#tag/plugins/paths/~1plugins/post
             * @param {string} filename - name of the plugin to upload
             * @returns {Response} response: Cypress-chainable response
             *
             * @example
             *   cy.apiUploadPlugin('filename');
             */
            apiUploadPlugin: typeof apiUploadPlugin

            /**
             * Upload a plugin and enable.
             * - If a plugin is already active, then it will immediately return.
             * - If a plugin is inactive, then it will be enabled only.
             * - If a plugin is not found in the server, then it will be uploaded
             * and the enabled.
             * - On plugin upload, if `pluginTestInfo` includes a `url` field, then
             * the plugin will be installed via URL. Otherwise if `filename` field
             * is present, then it will look at such filename under fixtures folder
             * and then use the file to upload.
             *
             * @param {PluginTestInfo} pluginTestInfo - plugin test info
             * @returns {Response} response: Cypress-chainable response
             *
             * @example
             *   cy.apiUploadAndEnablePlugin(pluginTestInfo);
             */
            apiUploadAndEnablePlugin: typeof apiUploadAndEnablePlugin;

            /**
             * Install plugin from url.
             * See https://api.mattermost.com/#tag/plugins/paths/~1plugins~1install_from_url/post
             * @param {string} pluginDownloadUrl - URL used to download the plugin
             * @param {string} force - Set to 'true' to overwrite a previously installed plugin with the same ID, if any
             * @returns {PluginManifest} `out.plugin` as `PluginManifest`
             *
             * @example
             *   cy.apiInstallPluginFromUrl('url', 'true').then(({plugin}) => {
             *       // do something with plugin
             *   });
             */
            apiInstallPluginFromUrl: typeof apiInstallPluginFromUrl;

            /**
             * Enable plugin.
             * See https://api.mattermost.com/#tag/plugins/paths/~1plugins~1{plugin_id}~1enable/post
             * @param {string} pluginId - Id of the plugin to enable
             * @returns {string} `out.status`
             *
             * @example
             *   cy.apiEnablePluginById('pluginId');
             */
            apiEnablePluginById: typeof apiEnablePluginById;

            /**
             * Disable plugin.
             * See https://api.mattermost.com/#tag/plugins/paths/~1plugins~1{plugin_id}~disable/post
             * @param {string} pluginId - Id of the plugin to disable
             * @returns {string} `out.status`
             *
             * @example
             *   cy.apiDisablePluginById('pluginId');
             */
            apiDisablePluginById(pluginId: string): Chainable<Record<string, any>>;

            /**
             * Disable all plugins installed that are not prepackaged.
             *
             * @example
             *   cy.apiDisableNonPrepackagedPlugins();
             */
            apiDisableNonPrepackagedPlugins: typeof apiDisableNonPrepackagedPlugins;

            /**
             * Remove plugin.
             * See https://api.mattermost.com/#tag/plugins/paths/~1plugins~1{plugin_id}/delete
             * @param {string} pluginId - Id of the plugin to uninstall
             * @returns {string} `out.status`
             *
             * @example
             *   cy.apiRemovePluginById('url');
             */
            apiRemovePluginById: typeof apiRemovePluginById;

            /**
             * Removes all active and inactive plugins.
             *
             * @example
             *   cy.apiUninstallAllPlugins();
             */
            apiUninstallAllPlugins: typeof apiUninstallAllPlugins;
        }
    }
}
