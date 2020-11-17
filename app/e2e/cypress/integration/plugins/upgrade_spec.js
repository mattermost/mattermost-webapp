// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console @plugin

/**
 * Note : This test requires two demo plugin tar files under fixtures folder.
 * Download version 0.1.0 from :
 * https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.1.0/com.mattermost.demo-plugin-0.1.0.tar.gz
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.demo-plugin-0.1.0.tar.gz
 *
 * Download version 0.2.0 from :
 * https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.2.0/com.mattermost.demo-plugin-0.2.0.tar.gz
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.demo-plugin-0.2.0.tar.gz
 */

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Plugin remains enabled when upgraded', () => {
    const pluginIdDemo = 'com.mattermost.demo-plugin';
    const demoPluginURL = 'https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.1.0/com.mattermost.demo-plugin-0.1.0.tar.gz';

    before(() => {
        // # Initialize setup and visit town-square
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // # If Demo plugin is already enabled , uninstall it
            cy.apiRemovePluginById(pluginIdDemo);
            cy.visit('/admin_console/plugins/plugin_management');
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Plugin Management');
        });
    });

    after(() => {
        cy.apiRemovePluginById(pluginIdDemo);
    });

    it('MM-T40 Plugin remains enabled when upgraded', () => {
        // * Upload Demo plugin from the browser
        const fileName1 = 'com.mattermost.demo-plugin-0.1.0.tar.gz';
        const fileName2 = 'com.mattermost.demo-plugin-0.2.0.tar.gz';
        const mimeType = 'application/gzip';
        cy.fixture(fileName1, 'binary').
            then(Cypress.Blob.binaryStringToBlob).
            then((fileContent) => {
                cy.get('input[type=file]').attachFile({fileContent, fileName: fileName1, mimeType});
            });

        cy.get('#uploadPlugin').scrollIntoView().should('be.visible').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify that the button shows correct text while uploading
        cy.findByText('Uploading...', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // * Verify that the button shows correct text and is disabled after upload
        cy.findByText('Upload', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        cy.get('#uploadPlugin').and('be.disabled');

        // # Enable demo plugin
        doTaskOnPlugin(pluginIdDemo, () => {
        // * Verify Demo Plugin title is shown
            cy.waitUntil(() => cy.get('strong').scrollIntoView().should('be.visible').then((title) => {
                return title[0].innerText === 'Demo Plugin';
            }));

            // # Click on Enable link
            cy.findByText('Enable').click();
        });

        // * Verify V0.1.0 of plugin
        cy.findByText(/0.1.0/).scrollIntoView().should('be.visible');

        cy.get('#uploadPlugin').scrollIntoView().should('be.visible');

        // # Upgrade plugin
        cy.fixture(fileName2, 'binary').
            then(Cypress.Blob.binaryStringToBlob).
            then((fileContent) => {
                cy.get('input[type=file]').attachFile({fileContent, fileName: fileName2, mimeType});
            });

        // * Verify that the button shows correct text while uploading
        cy.get('#uploadPlugin').should('be.visible').click().wait(TIMEOUTS.HALF_SEC);

        // # Confirm overwrite of plugin with same name
        cy.get('#confirmModalButton').should('be.visible').click();

        doTaskOnPlugin(pluginIdDemo, () => {
        // * Verify plugin is running
            waitForAlert('This plugin is running.');
        });

        // * Verify v0.2.0 of plugin
        cy.findByText(/0.2.0/).scrollIntoView().should('be.visible');
    });

    it('MM-T39 Disable Plugin on Removal', () => {
        // # Install demo plugin and enable it
        cy.apiAdminLogin();
        cy.apiInstallPluginFromUrl(demoPluginURL, true).then(() => {
            cy.apiEnablePluginById(pluginIdDemo);
        });

        // # Remove demo plugin
        cy.apiRemovePluginById(pluginIdDemo);

        // # Install demo plugin again
        cy.apiInstallPluginFromUrl(demoPluginURL, true);

        // * Confirm demo plugin is not enabled
        cy.apiGetAllPlugins().then((response) => {
            const {active, inactive} = response.plugins;

            let found = false;
            active.forEach((plugin) => {
                if (plugin.id === pluginIdDemo) {
                    found = true;
                }
            });
            expect(found).to.be.false;

            found = false;
            inactive.forEach((plugin) => {
                if (plugin.id === pluginIdDemo) {
                    found = true;
                }
            });
            expect(found).to.be.true;
        });
    });
});

function waitForAlert(message) {
    cy.waitUntil(() => cy.get('.alert').scrollIntoView().should('be.visible').then((alert) => {
        return alert[0].innerText === message;
    }));
}

function doTaskOnPlugin(pluginId, taskCallback) {
    cy.findByText(/Installed Plugins/).scrollIntoView().should('be.visible');
    cy.findByTestId(pluginId).scrollIntoView().should('be.visible').within(() => {
        // # Perform task
        taskCallback();
    });
}
