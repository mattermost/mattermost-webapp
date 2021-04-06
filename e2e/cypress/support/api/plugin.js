// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../fixtures/timeouts';

// *****************************************************************************
// Plugins
// https://api.mattermost.com/#tag/plugins
// *****************************************************************************

Cypress.Commands.add('apiGetAllPlugins', () => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/plugins',
        method: 'GET',
        failOnStatusCode: false,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap({plugins: response.body});
    });
});

Cypress.Commands.add('apiUploadPlugin', (filename, waitTime = TIMEOUTS.HALF_MIN) => {
    return cy.apiUploadFile('plugin', filename, {url: '/api/v4/plugins', method: 'POST', successStatus: 201}).then(() => {
        return cy.wait(waitTime);
    });
});

Cypress.Commands.add('apiInstallPluginFromUrl', (pluginDownloadUrl, force = false, waitTime = TIMEOUTS.HALF_MIN) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/install_from_url?plugin_download_url=${encodeURIComponent(pluginDownloadUrl)}&force=${force}`,
        method: 'POST',
        timeout: TIMEOUTS.ONE_MIN,
        failOnStatusCode: false,
    }).then((response) => {
        expect(response.status).to.equal(201);

        cy.wait(waitTime);
        return cy.wrap({plugin: response.body});
    });
});

Cypress.Commands.add('apiEnablePluginById', (pluginId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/${encodeURIComponent(pluginId)}/enable`,
        method: 'POST',
        timeout: TIMEOUTS.ONE_MIN,
        failOnStatusCode: false,
    }).then((response) => {
        expect(response.status).to.equal(200);
        return cy.wrap(response);
    });
});

Cypress.Commands.add('apiDisablePluginById', (pluginId) => {
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
});

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

Cypress.Commands.add('apiDisableNonPrepackagedPlugins', () => {
    cy.apiGetAllPlugins().then(({plugins}) => {
        plugins.active.forEach((plugin) => {
            if (!prepackagedPlugins.includes(plugin.id)) {
                cy.apiDisablePluginById(plugin.id);
            }
        });
    });
});

Cypress.Commands.add('apiRemovePluginById', (pluginId) => {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: `/api/v4/plugins/${encodeURIComponent(pluginId)}`,
        method: 'DELETE',
        failOnStatusCode: false,
    }).then((response) => {
        return cy.wrap(response);
    });
});
