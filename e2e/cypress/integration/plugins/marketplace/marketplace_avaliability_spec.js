// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Plugin Marketplace availability', () => {
    it('should not render Marketplace for non admin user', () => {
        // # Set ServiceSettings to expected values
        const newSettings = {
            PluginSettings: {
                Enable: true,
                EnableUploads: true,
                EnableMarketplace: true,
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as non admin user
        cy.apiLogin('user-1');
        cy.visit('/');

        // # Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').click();

        // * Dropdown menu should be visible
        cy.get('#sidebarDropdownMenu').should('be.visible');

        // * Marketplace button should not be visible
        cy.get('#marketplaceModal').should('not.be.visible');
    });

    it('should not connect to the Marketplace server', () => {
        // # Set ServiceSettings to expected values
        const newSettings = {
            PluginSettings: {
                Enable: true,
                EnableUploads: true,
                EnableMarketplace: true,
                MarketplaceUrl: 'some_site.com',
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as non admin user
        cy.apiLogin('sysadmin');
        cy.visit('/');

        // # Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').click();

        // * Dropdown menu should be visible
        cy.get('#sidebarDropdownMenu').should('be.visible');

        // * Marketplace button should be visible
        cy.get('#marketplaceModal').should('be.visible');

        // # Open up marketplace modal
        cy.get('#marketplaceModal').click();

        // * Should be an error connecting to the marketplace server
        cy.get('#error_bar').contains('Error connecting to the marketplace server');
    });
});
