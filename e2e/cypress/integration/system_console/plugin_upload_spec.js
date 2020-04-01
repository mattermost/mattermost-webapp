// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console

/**
 * Note : This test requires draw plugin tar file under fixtures folder.
 * Download from : https://integrations.mattermost.com/draw-plugin/
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.draw-plugin.tar.gz
 */

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Draw Plugin - Upload', () => {
    const fileName = 'com.mattermost.draw-plugin.tar.gz';
    const fileType = 'application/gzip';
    const pluginId = 'com.mattermost.draw-plugin';
    before(() => {
        // # Login as sysadmin and update config
        cy.apiLogin('sysadmin');
        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
                RequirePluginSignature: false,
            },
        });

        // # Visit town-square channel
        cy.visit('/ad-1/channels/town-square');

        // #If draw plugin is already enabled , unInstall it
        cy.uninstallPluginById(pluginId);
        cy.visit('/admin_console/plugins/plugin_management');
    });

    /**
     * Draw Plugin configuration UI test - For Admin Access
    */
    it('M11759-Draw plugin Configuration - should upload draw plugin', () => {
        // * upload Draw plugin from the browser
        cy.get('input[type=file]').uploadFile(fileName, fileType).wait(TIMEOUTS.TINY);
        cy.get('#uploadPlugin').should('be.visible').click().wait(TIMEOUTS.TINY);

        // * Verify that the button shows correct text while uploading
        cy.findByText('Uploading...').should('be.visible');

        // * Verify that the button shows correct text and is disabled after upload
        cy.findByText('Upload').should('be.visible');
        cy.get('#uploadPlugin').and('be.disabled');

        // * Verify that the Draw Plugin is shown on successful upload
        cy.findByText('Draw Plugin').should('be.visible');

        // # Draw plugin ID should be visible
        cy.findByTestId('com.mattermost.draw-plugin').should('be.visible').within(() => {
            // #Enable draw plugin and check plugin is running
            cy.wait(TIMEOUTS.TINY).findByText('Enable').click();
            cy.findByText('This plugin is running.').should('be.visible');

            // #Disable draw plugin and check plugin is not enabled
            cy.findByText('Disable').click();
            cy.findByText('This plugin is not enabled.').should('be.visible');

            // * Click on remove
            cy.findByText('Remove').click();
        });

        // #Remove plugin Id should exist upon clicking Cancel in confirmation popup
        cy.get('#cancelModalButton').should('be.visible').click();
        cy.findByTestId('com.mattermost.draw-plugin').should('exist');

        cy.findByTestId('com.mattermost.draw-plugin').should('be.visible').within(() => {
            // * Click on remove
            cy.wait(TIMEOUTS.TINY).findByText('Remove').click();
        });

        // #Remove plugin Id should not exist upon clicking remove in confirmation popup
        cy.findByText('Are you sure you would like to remove the plugin?').should('be.visible');
        cy.get('#confirmModalButton').should('be.visible').click();
        cy.findByTestId('com.mattermost.draw-plugin').should('not.exist');
    });
});

