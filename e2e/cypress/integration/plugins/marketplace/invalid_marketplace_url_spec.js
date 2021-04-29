// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @not_cloud @plugin_marketplace @plugin

import * as TIMEOUTS from '../../../fixtures/timeouts';
import {githubPlugin} from '../../../utils/plugins';

describe('Plugin Marketplace', () => {
    let townsquareLink;

    before(() => {
        cy.shouldNotRunOnCloudEdition();
        cy.shouldHavePluginUploadEnabled();

        cy.apiInitSetup().then(({team}) => {
            townsquareLink = `/${team.name}/channels/town-square`;
        });
    });

    beforeEach(() => {
        // # Login as sysadmin
        cy.apiAdminLogin();

        // # Enable Plugin Marketplace and Remote Marketplace
        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
                EnableMarketplace: true,
                EnableRemoteMarketplace: true,
                MarketplaceUrl: 'example.com',
            },
        });

        // # Cleanup installed plugins
        cy.apiUninstallAllPlugins();

        // # Visit the Town Square channel
        cy.visit(townsquareLink);

        cy.wait(TIMEOUTS.HALF_SEC).get('#lhsHeader').should('be.visible').within(() => {
            // # Click hamburger main menu
            cy.get('#sidebarHeaderDropdownButton').click();

            // * Verify dropdown menu should be visible
            cy.get('.dropdown-menu').should('be.visible').within(() => {
                // * Verify Plugin Marketplace button should be visible then click
                cy.findByText('Marketplace').should('be.visible').click();
            });
        });
    });

    it('render an error bar', () => {
        // * Verify should be an error connecting to the marketplace server
        cy.get('#error_bar').contains('Error connecting to the marketplace server');
    });

    it('show an error bar on failing to filter', () => {
        // # Enable Plugin Marketplace
        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
                EnableMarketplace: true,
                MarketplaceUrl: 'example.com',
            },
        });

        // # Filter to jira plugin only
        cy.get('#searchMarketplaceTextbox').type('jira', {force: true});

        // * Verify should be an error connecting to the marketplace server
        cy.get('#error_bar').contains('Error connecting to the marketplace server');
    });

    it('display installed plugins and error bar', () => {
        // # Install one plugin
        cy.apiInstallPluginFromUrl(githubPlugin.url, true);

        // # Scroll to GitHub plugin
        cy.get('#marketplace-plugin-github').scrollIntoView().should('be.visible');

        // * Verify the installed plugin shows up in "Installed" tab
        cy.get('#marketplaceTabs-tab-installed').scrollIntoView().should('be.visible').click();
        cy.get('#marketplaceTabs-pane-installed').find('.more-modal__row').should('have.length', 1);

        // * Verify should be an error connecting to the marketplace server
        cy.get('#error_bar').contains('Error connecting to the marketplace server');
    });
});
