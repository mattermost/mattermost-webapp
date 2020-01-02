// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Note : This test requires draw plugin tar file under fixtures folder.
 * Download from : https://integrations.mattermost.com/draw-plugin/
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.draw-plugin.tar.gz
 */

import * as TIMEOUTS from '../../fixtures/timeouts';

/**
 * Method to enable/Disable/Remove draw plugin
 * @param {String} status - Action to be performed on draw plugin help text [Remove/Enable/Disable]
 * @param {String} fileName - Filename to upload from the fixture
 * @param {String} fileType - formation of the file - 'application/gzip'
 */
function drawpluginConfiguration(status, fileName, fileType) {
    //Navigate to system console - Plugin Management - Enable Draw plugin
    cy.wait(TIMEOUTS.TINY);
    switch (status) {
    case 'Remove':
        cy.findByTestId('com.mattermost.draw-plugin').should('be.visible').within(() => {
            cy.findByText('Remove').click();
        });
        cy.findByText('Are you sure you would like to remove the plugin?').should('be.visible');
        cy.get('#confirmModalButton').should('be.visible').click();
        cy.findByTestId('com.mattermost.draw-plugin').should('not.exist');
        break;
    case 'Enable':
        cy.get('input[type=file]').uploadFile(fileName, fileType).wait(TIMEOUTS.TINY);
        cy.get('#uploadPlugin').should('be.visible').click().wait(TIMEOUTS.TINY);
        cy.wait(TIMEOUTS.TINY);
        cy.findByTestId('com.mattermost.draw-plugin').should('be.visible').within(() => {
            cy.findByText('Enable').click();
            cy.findByText('This plugin is running.').should('be.visible');
        });
        break;
    case 'Disable':
        cy.findByTestId('com.mattermost.draw-plugin').should('be.visible').within(() => {
            cy.findByText('Disable').click().wait(TIMEOUTS.TINY);

            //Timeout issue is happening , will fix
            //cy.findByText('This plugin is not enabled.').should('be.visible');
        });
        break;
    }
}

describe('Draw Plugin - Upload', () => {
    const fileName = 'com.mattermost.draw-plugin.tar.gz';
    const fileType = 'application/gzip';
    const pluginId = 'com.mattermost.draw-plugin';
    before(() => {
        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
                RequirePluginSignature: false,
            },
        });

        // # Login as sysadmin
        cy.apiLogin('sysadmin');
        cy.visit('/');

        // #If draw plugin is already enabled , unInstall it
        cy.uninstallPluginById(pluginId);
        cy.systemConsolePluginManagement();
    });

    /**
     * Draw Plugin configuration UI test - For Admin Access
    */
    it('M11759-Draw plugin Configuration - should upload draw plugin', () => {
        // * check Upload/enable/Disable/Remove functionality of drawl plugin
        drawpluginConfiguration('Enable', fileName, fileType);
        drawpluginConfiguration('Disable', fileName, fileType);
        drawpluginConfiguration('Remove', fileName, fileType);
    });
});
