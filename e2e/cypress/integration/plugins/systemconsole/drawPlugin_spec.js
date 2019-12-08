// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../fixtures/timeouts';
import 'cypress-file-upload';

describe('Draw Plugin - Upload', () => {
    after(() => {
        // # Restore default configuration 
        const newSettings = {
            PluginSettings: {
                Enable: true,
                EnableMarketplace: true,
                MarketplaceUrl: 'https://api.integrations.mattermost.com',
            },
        };
        cy.apiUpdateConfig(newSettings);
    });
    /**
     * Draw Plugin configuration test - For Admin Access
     */
    it('should upload draw plugin', () => {   
        //cy.apiUpdateConfig(newSettings);
        // # Login as sysadmin
        cy.apiLogin('sysadmin');
        cy.visit('/');

        cy.navigateToSystemConsoleFromAdminSettings();  
        cy.searchForPluginManagementSysConsole();

        //Check whether plugin content exists on RHS after searching for a plugin management in LHS
        cy.get('form.form-horizontal').should('be.visible').within(() => {
            cy.get('div.wrapper--fixed').find('div.admin-console__header').should('be.visible').within(() => {
                cy.get('span > mark').findByText('Plugin').should('be.visible');
            });
        });    
        //Check enable plugin option is enabled
        cy.enableDisablePluginabsPath(true);
        //check Upload/enable/Disable/Remove functionality of drawl plugin
        cy.enableDisableDrawPlugin("Enable",fileName,fileType);
        cy.enableDisableDrawPlugin("Disable",fileName,fileType);
        cy.enableDisableDrawPlugin("Remove",fileName,fileType);
    });
        /**
         * Section holds constants which are required for this spec
         */
        const subject='cypress/fixtures/matterMost.tar.gz';
        const fileName = 'cypress/fixtures/matterMost.tar.gz';
        const fileType = 'application/gzip';
});
