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

    /**
     * Draw Plugin configuration UI test - For Admin Access
    */
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

        // # Draw plugin ID should be visible
        cy.findByTestId('com.mattermost.draw-plugin').should('be.visible').within(() => {
            // * Verify that the Draw Plugin is shown on successful upload
            cy.findByText('Draw Plugin').should('be.visible');

            // #Enable draw plugin and check plugin is running
            cy.wait(TIMEOUTS.HALF_SEC).findByText('Enable').click();
            cy.findByText('This plugin is running.').should('be.visible');

            // #Disable draw plugin
            cy.findByText('Disable').click();
        });

        // # Need to re-query DOM elements as they are updated asynchronously
        cy.findByTestId('com.mattermost.draw-plugin').scrollIntoView().should('be.visible').within(() => {
            // * Check plugin is not enabled
            cy.wait(TIMEOUTS.HALF_SEC).findByText('This plugin is not enabled.').should('be.visible');

            // * Click on remove
            cy.findByText('Remove').click();
        });

        // #Remove plugin Id should exist upon clicking Cancel in confirmation popup
        cy.get('#cancelModalButton').should('be.visible').click();
        cy.findByTestId('com.mattermost.draw-plugin').should('exist');

        cy.findByTestId('com.mattermost.draw-plugin').should('be.visible').within(() => {
            // * Click on remove
            cy.wait(TIMEOUTS.HALF_SEC).findByText('Remove').click();
        });

        // #Remove plugin Id should not exist upon clicking remove in confirmation popup
        cy.findByText('Are you sure you would like to remove the plugin?').should('be.visible');
        cy.get('#confirmModalButton').should('be.visible').click();
        cy.findByTestId('com.mattermost.draw-plugin').should('not.exist');
    });
});
