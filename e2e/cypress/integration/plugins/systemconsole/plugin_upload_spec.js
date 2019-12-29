// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Note : This test requires draw plugin tar file under fixtures folder.
 * Download from : https://integrations.mattermost.com/draw-plugin/
 * Copy to : ./e2e/cypress/fixtures/com.mattermost.draw-plugin.tar.gz
 */

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
        cy.drawpluginConfiguration('Enable', fileName, fileType);
        cy.drawpluginConfiguration('Disable', fileName, fileType);
        cy.drawpluginConfiguration('Remove', fileName, fileType);
    });
});
