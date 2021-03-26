// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @not_cloud @system_console @plugin

/**
 * Note : This test requires draw plugin tar file under fixtures folder.
 * Download from : https://integrations.mattermost.com/draw-plugin/
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.draw-plugin.tar.gz
 */

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Draw Plugin - Upload', () => {
    const pluginId = 'com.mattermost.draw-plugin';

    before(() => {
        cy.shouldNotRunOnCloudEdition();
        cy.shouldHavePluginUploadEnabled();

        // # Update config
        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
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

        // * Verify Draw Plugin is installed, then click "Enable"
        doPluginAction('Enable');

        // * Verify Draw Plugin is enabled
        checkPluginStatus('This plugin is running.');

        // # Disable draw plugin
        doPluginAction('Disable');

        // * Verify Draw Plugin is disabled
        checkPluginStatus('This plugin is not enabled.');

        // # Attempt to remove draw plugin
        doPluginAction('Remove');

        // # Click on Cancel button from modal
        cy.get('#cancelModalButton').should('be.visible').click();

        // * Verify Draw plugin should still be installed
        cy.findByTestId('com.mattermost.draw-plugin').should('be.visible');

        // # Attempt to remove draw plugin again
        doPluginAction('Remove');

        // # Click on Confirm button from modal
        cy.findByText('Are you sure you would like to remove the plugin?').should('be.visible');
        cy.get('#confirmModalButton').should('be.visible').click();

        // * Verify Draw plugin should not exist
        cy.findByTestId('com.mattermost.draw-plugin').should('not.exist');
    });
});

function doPluginAction(name) {
    cy.findByTestId('com.mattermost.draw-plugin').scrollIntoView().should('be.visible').
        findByText(name).click().wait(TIMEOUTS.ONE_SEC);
}

function checkPluginStatus(message) {
    cy.findByTestId('com.mattermost.draw-plugin').scrollIntoView().should('be.visible').
        findByText(message).should('be.visible');
}
