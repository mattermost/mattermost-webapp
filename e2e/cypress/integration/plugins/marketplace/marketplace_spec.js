// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Plugin Marketplace modal', () => {
    before(() => {
        // # Set ServiceSettings to expected values
        const newSettings = {
            PluginSettings: {
                Enable: true,
                EnableUploads: true,
                EnableMarketplace: true,
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as sysadmin
        cy.apiLogin('sysadmin');
        cy.visit('/');

        // # Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').click();

        // * Dropdown menu should be visible
        cy.get('#sidebarDropdownMenu').should('be.visible');

        // * Marketplace button should not be visible
        cy.get('#marketplaceModal').should('be.visible');

        // # Open up marketplace modal
        cy.get('#marketplaceModal').click();
    });

    it('should render Marketplace', () => {
        // * marketplace should be visible
        cy.get('#modal_marketplace').should('be.visible');

        // * error should not be visible
        cy.get('#error_bar').should('not.be.visible');

        // * search should be visible
        cy.get('#searchMarketplaceTextbox').should('be.visible');

        // * tabs should be visible
        cy.get('#marketplaceTabs').should('be.visible');

        // * all plugins tab button should be visible
        cy.get('#marketplaceTabs-tab-allPlugins').should('be.visible');

        // * installed plugins tabs button should be visible
        cy.get('#marketplaceTabs-tab-installed').should('be.visible');

        // * all plugins tab should be active
        cy.get('#marketplaceTabs-pane-allPlugins').should('be.visible');

        // # click on installed plugins tab
        cy.get('#marketplaceTabs-tab-installed').click();

        // * installed plugins tab should be active
        cy.get('#marketplaceTabs-pane-installed').should('be.visible');

        // # close marketplace modal
        cy.get('#closeIcon').click();

        // * marketplace should not be visible
        cy.get('#modal_marketplace').should('not.be.visible');
    });
});
