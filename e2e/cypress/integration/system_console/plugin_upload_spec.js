// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console @plugin

/**
 * Note : This test requires draw plugin tar file under fixtures folder.
 * Download from : https://integrations.mattermost.com/draw-plugin/
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.draw-plugin.tar.gz
 */

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Draw Plugin - Upload', () => {
    const pluginId = 'com.mattermost.draw-plugin';

    before(() => {
        // # Update config
        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
                RequirePluginSignature: false,
            },
        });

        // # Initialize setup and visit town-square
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // #If draw plugin is already enabled , unInstall it
            cy.apiRemovePluginById(pluginId);
            cy.visit('/admin_console/plugins/plugin_management');
            cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Plugin Management');
        });
    });

    it('M11759-Draw plugin Configuration - should upload draw plugin', () => {
        // * upload Draw plugin from the browser
        const fileName = 'com.mattermost.draw-plugin.tar.gz';
        const mimeType = 'application/gzip';
        cy.fixture(fileName, 'binary').
            then(Cypress.Blob.binaryStringToBlob).
            then((fileContent) => {
                cy.get('input[type=file]').attachFile({fileContent, fileName, mimeType});
            });

        cy.get('#uploadPlugin').should('be.visible').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify that the button shows correct text while uploading
        cy.findByText('Uploading...', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // * Verify that the button shows correct text and is disabled after upload
        cy.findByText('Upload', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        cy.get('#uploadPlugin').and('be.disabled');

        // # Enable draw plugin
        doTaskOnDrawPlugin(() => {
            // * Verify Draw Plugin title is shown
            cy.waitUntil(() => cy.get('strong').scrollIntoView().should('be.visible').then((title) => {
                return title[0].innerText === 'Draw Plugin';
            }));

            // # Click on Enable link
            cy.findByText('Enable').click();
        });

        // # Disable draw plugin
        doTaskOnDrawPlugin(() => {
            // * Verify plugin is starting
            waitForAlert('This plugin is starting.');

            // * Verify plugin is running
            waitForAlert('This plugin is running.');

            // # Click on Disable link
            cy.findByText('Disable').click();
        });

        // # Attempt to remove draw plugin
        doTaskOnDrawPlugin(() => {
            // * Verify plugin is not enabled
            waitForAlert('This plugin is not enabled.');

            // # Click on Remove link
            cy.findByText('Remove').click();
        });

        // # Click on Cancel button from modal
        cy.get('#cancelModalButton').should('be.visible').click();

        // # Attempt to remove draw plugin again
        doTaskOnDrawPlugin(() => {
            // # Click on Remove link
            cy.findByText('Remove').click();
        });

        // # Click on Confirm button from modal
        cy.findByText('Are you sure you would like to remove the plugin?').should('be.visible');
        cy.get('#confirmModalButton').should('be.visible').click();

        // * Verify Draw plugin should not exist
        cy.findByText(/Installed Plugins/).scrollIntoView().should('be.visible');
        cy.findByTestId('com.mattermost.draw-plugin').should('not.exist');
    });
});

function waitForAlert(message) {
    cy.waitUntil(() => cy.get('.alert').scrollIntoView().should('be.visible').then((alert) => {
        return alert[0].innerText === message;
    }));
}

function doTaskOnDrawPlugin(taskCallback) {
    cy.findByText(/Installed Plugins/).scrollIntoView().should('be.visible');
    cy.findByTestId('com.mattermost.draw-plugin').scrollIntoView().should('be.visible').within(() => {
        // # Perform task
        taskCallback();
    });
}
