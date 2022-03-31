// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @plugin @system_console

describe('System Console > Plugin Management ', () => {
    before(() => {
        cy.shouldNotRunOnCloudEdition();

        // // # Login as Admin
        // cy.apiInitSetup().then(({team}) => {
        // });
        // cy.apiAdminLogin();
    });

    it('MM-xxx Plugin Marketplace URL should be disabled if EnableUploads are disabled', () => {
        // # Set plugin settings
        let newSettings = {
            PluginSettings: {
                Enable: true,
                EnableUploads: false,
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as System Admin
        cy.apiAdminLogin();

        cy.visit('/admin_console/plugins/plugin_management');

        // * Verify marketplace URL is disabled.
        cy.findByTestId('marketplaceUrlinput').should('be.disabled');

        // # Set plugin settings
        newSettings = {
            PluginSettings: {
                Enable: true,
                EnableUploads: true,
            },
        };
        cy.apiUpdateConfig(newSettings);

        cy.reload();

        // * Verify marketplace URL is enabled.
        cy.findByTestId('marketplaceUrlinput').should('be.enabled');
    });

});