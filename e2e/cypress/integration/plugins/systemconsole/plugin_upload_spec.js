// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Note : This test requires draw plugin tar file under fixtures folder.
 * Download from : https://integrations.mattermost.com/draw-plugin/
 * Copy to : <MatterMostWebAppsLocation>e2e/cypress/fixtures/
 */

describe('Draw Plugin - Upload', () => {
    /**
     * Draw Plugin configuration test - For Admin Access
    */
    it('M11759-Draw plugin Configuration - should upload draw plugin', () => {
        // # Login as sysadmin
        cy.apiLogin('sysadmin');
        cy.visit('/');

        cy.navigateToSystemConsoleFromAdminSettings();
        cy.searchForPluginManagementSysConsole();

        //Check whether plugin content exists on RHS after searching for a plugin management in LHS
        cy.get('#adminPluginManagementHeader').should('have.text', 'Plugin Management').should('be.visible');

        //Check enable plugin option is enabled
        cy.enableDisablePluginabsPath(true);

        //check Upload/enable/Disable/Remove functionality of drawl plugin
        cy.enableDisableDrawPlugin('Enable', fileName, fileType);
        cy.enableDisableDrawPlugin('Disable', fileName, fileType);
        cy.enableDisableDrawPlugin('Remove', fileName, fileType);

        //Logout from the user
        cy.apiLogout();
    });

    /**
     * Enable or disable Plugin in plugin management RHS
    */
    Cypress.Commands.add('enableDisablePluginabsPath', (enableDisable) => {
        cy.get(`#enable${enableDisable}`).should('be.visible').click();
    });

    /**
    * Section holds constants which are required for this spec
    */
    const fileName = 'drawPlugin-binary.tar.gz';
    const fileType = 'application/gzip';
});
