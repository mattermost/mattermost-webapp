// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @plugin_marketplace @plugin

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Plugin Marketplace', () => {
    let townsquareLink;
    let pluginManagementPage;
    let regularUser;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            regularUser = user;
            townsquareLink = `/${team.name}/channels/town-square`;
            pluginManagementPage = '/admin_console/plugins/plugin_management';
        });
    });

    describe('should not render in main menu', () => {
        it('MM-T1952 Plugin Marketplace is not available to normal users', () => {
            // # Login as sysadmin
            cy.apiAdminLogin();

            // # Enable Plugin Marketplace
            cy.apiUpdateConfig({
                PluginSettings: {
                    Enable: true,
                    EnableMarketplace: true,
                    MarketplaceUrl: 'https://api.integrations.mattermost.com',
                },
            });

            // # Login as non admin user
            cy.apiLogin(regularUser);
            cy.visit(townsquareLink);

            // * Verify Plugin Marketplace does not exist
            verifyPluginMarketplaceVisibility(false);
        });

        it('MM-T1957 Marketplace is not available when "Enable Marketplace" is set to false', () => {
            // # Login as sysadmin
            cy.apiAdminLogin();

            // # Enable Plugins
            // # Disable Plugin Marketplace
            cy.apiUpdateConfig({
                PluginSettings: {
                    Enable: true,
                    EnableMarketplace: false,
                    MarketplaceUrl: 'https://api.integrations.mattermost.com',
                },
            });

            // # Visit town-square channel
            cy.visit(townsquareLink);

            // * Verify Plugin Marketplace does not exist
            verifyPluginMarketplaceVisibility(false);
        });

        it('MM-T1959 Marketplace is not available when "Enable Plugins" is false', () => {
            // # Login as sysadmin
            cy.apiAdminLogin();

            // # Disable Plugins
            // # Enable Plugin Marketplace
            cy.apiUpdateConfig({
                PluginSettings: {
                    Enable: false,
                    EnableMarketplace: true,
                    MarketplaceUrl: 'https://api.integrations.mattermost.com',
                },
            });

            // # Visit town-square channel
            cy.visit(townsquareLink);

            // * Verify Plugin Marketplace does not exist
            verifyPluginMarketplaceVisibility(false);
        });
    });

    describe('should render in main menu', () => {
        it('MM-T1960 Marketplace is available when "Enable Plugins" is true', () => {
            // # Login as sysadmin
            cy.apiAdminLogin();

            // # Disable Plugins
            // # Enable Plugin Marketplace
            cy.apiUpdateConfig({
                PluginSettings: {
                    Enable: false,
                    EnableMarketplace: true,
                    MarketplaceUrl: 'https://api.integrations.mattermost.com',
                },
            });
            cy.visit(pluginManagementPage);

            cy.wait(TIMEOUTS.HALF_SEC).get('input[data-testid="enablefalse"]').should('be.checked');
            cy.get('input[data-testid="enabletrue"]').check();
            cy.get('#saveSetting').click();

            // Verify that the Plugin Marketplace is available
            cy.visit(townsquareLink);
            verifyPluginMarketplaceVisibility(true);
        });

        it('MM-T1958 Marketplace is available when "Enable Marketplace" is set to true', () => {
            // # Login as sysadmin
            cy.apiAdminLogin();

            // # Enable Plugins
            // # Disable Plugin Marketplace
            cy.apiUpdateConfig({
                PluginSettings: {
                    Enable: true,
                    EnableMarketplace: false,
                    MarketplaceUrl: 'https://api.integrations.mattermost.com',
                },
            });
            cy.visit(pluginManagementPage);

            cy.wait(TIMEOUTS.HALF_SEC).get('input[data-testid="enableMarketplacefalse"]').should('be.checked');
            cy.get('input[data-testid="enableMarketplacetrue"]').check();
            cy.get('#saveSetting').click();

            // Verify that the Plugin Marketplace is available
            cy.visit(townsquareLink);
            verifyPluginMarketplaceVisibility(true);
        });
    });

    describe('invalid marketplace, should', () => {
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
            uninstallAllPlugins();

            // # Visit the Town Square channel
            cy.visit(townsquareLink);

            cy.wait(TIMEOUTS.HALF_SEC).get('#lhsHeader').should('be.visible').within(() => {
                // # Click hamburger main menu
                cy.get('#sidebarHeaderDropdownButton').click();

                // * Verify dropdown menu should be visible
                cy.get('.dropdown-menu').should('be.visible').within(() => {
                    // * Verify Plugin Marketplace button should be visible then click
                    cy.findByText('Plugin Marketplace').should('be.visible').click();
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
            cy.apiInstallPluginFromUrl('https://github.com/mattermost/mattermost-plugin-github/releases/download/v0.7.0/github-0.7.0.tar.gz', true);

            // # Scroll to GitHub plugin
            cy.get('#marketplace-plugin-github').scrollIntoView().should('be.visible');

            // * Verify one local plugin should be installed
            cy.get('#marketplaceTabs-tab-installed').scrollIntoView().should('be.visible').click();
            cy.get('#marketplaceTabs-pane-installed').find('.more-modal__row').should('have.length', 1);

            // * Verify should be an error connecting to the marketplace server
            cy.get('#error_bar').contains('Error connecting to the marketplace server');
        });
    });

    describe('should', () => {
        beforeEach(() => {
            // # Enable Plugin Marketplace and Remote Marketplace
            // # Disable Plugin State Github and Webex
            cy.apiUpdateConfig({
                PluginSettings: {
                    Enable: true,
                    EnableMarketplace: true,
                    EnableRemoteMarketplace: true,
                    MarketplaceUrl: 'https://api.integrations.mattermost.com',
                    PluginStates: {
                        github: {
                            Enable: false,
                        },
                        'com.mattermost.webex': {
                            Enable: false,
                        },
                    },
                },
            });

            // # Cleanup installed plugins
            uninstallAllPlugins();

            // # Visit the Town Square channel
            cy.visit(townsquareLink);

            cy.wait(TIMEOUTS.HALF_SEC).get('#lhsHeader').should('be.visible').within(() => {
                // # Click hamburger main menu
                cy.get('#sidebarHeaderDropdownButton').click();

                // * Verify dropdown menu should be visible
                cy.get('.dropdown-menu').should('be.visible').within(() => {
                    // * Plugin Marketplace button should be visible then click
                    cy.findByText('Plugin Marketplace').should('be.visible').click();
                });
            });

            // * Verify error bar should not be visible
            cy.get('#error_bar').should('not.be.visible');

            // * Verify search should be visible
            cy.findByPlaceholderText('Search Plugins').scrollIntoView().should('be.visible');

            // * Verify tabs should be visible
            cy.get('#marketplaceTabs').scrollIntoView().should('be.visible');

            // * Verify all plugins tab button should be visible
            cy.get('#marketplaceTabs-tab-allPlugins').scrollIntoView().should('be.visible');

            // * Verify installed plugins tabs button should be visible
            cy.get('#marketplaceTabs-tab-installed').scrollIntoView().should('be.visible');

            // * Verify modal list is visible
            cy.get('.more-modal__list').scrollIntoView().should('be.visible');
        });

        it('autofocus on search plugin input box', () => {
            // * Verify search plugins should be focused
            cy.findByPlaceholderText('Search Plugins').scrollIntoView().should('be.focused');
        });

        it('render the list of all plugins by default', () => {
            // * Verify all plugins tab should be active
            cy.get('#marketplaceTabs-pane-allPlugins').should('exist');

            // * Verify installed plugins tab should not be active
            cy.get('#marketplaceTabs-pane-installed').should('not.exist');
        });

        // this test uses exist, not visible, due to issues with Cypress
        it('render the list of installed plugins on demand', () => {
            // # Click on installed plugins tab
            cy.get('#marketplaceTabs-tab-installed').scrollIntoView().should('be.visible').click();

            // * Verify all plugins tab should not be active
            cy.get('#marketplaceTabs-pane-allPlugins').should('not.exist');

            // * Verify installed plugins tab should exist
            cy.get('#marketplaceTabs-pane-installed').should('exist');
        });

        it('should close the modal on demand', () => {
            // # Close marketplace modal
            cy.get('#closeIcon').click();

            // * Verify marketplace should not be visible
            cy.get('#modal_marketplace').should('not.be.visible');
        });

        it('should filter all on search', () => {
            // # Filter to jira plugin only
            cy.findByPlaceholderText('Search Plugins').scrollIntoView().should('be.visible').type('jira');

            // * Verify jira plugin should be visible
            cy.get('#marketplace-plugin-jira').should('be.visible');

            // * Verify no other plugins should be visible
            cy.get('#marketplaceTabs-pane-allPlugins').find('.more-modal__row').should('have.length', 1);
        });

        it('should show an error bar on failing to filter', () => {
            // # Enable Plugin Marketplace
            cy.apiUpdateConfig({
                PluginSettings: {
                    Enable: true,
                    EnableMarketplace: true,
                    MarketplaceUrl: 'example.com',
                },
            });

            // # Filter to jira plugin only
            cy.findByPlaceholderText('Search Plugins').scrollIntoView().should('be.visible').type('jira');

            // * Verify should be an error connecting to the marketplace server
            cy.get('#error_bar').contains('Error connecting to the marketplace server');
        });

        it('should install a plugin on demand', () => {
            // # Uninstall any existing webex plugin
            cy.apiRemovePluginById('com.mattermost.webex');

            // * Verify webex plugin should be visible
            cy.findByText('Next').click();
            cy.get('#marketplace-plugin-com\\.mattermost\\.webex').scrollIntoView().should('be.visible');

            // # Install the webex plugin
            cy.get('#marketplace-plugin-com\\.mattermost\\.webex').find('.btn.btn-primary').click();

            // * Verify should show "Configure" after installation
            cy.get('#marketplace-plugin-com\\.mattermost\\.webex').find('.btn.btn-outline', {timeout: TIMEOUTS.ONE_MIN}).scrollIntoView().should('be.visible').and('have.text', 'Configure');
        });

        it('should install a plugin from search results on demand', () => {
            // # Uninstall any existing webex plugin
            cy.apiRemovePluginById('com.mattermost.webex');

            // # Filter to webex plugin only
            cy.findByPlaceholderText('Search Plugins').scrollIntoView().should('be.visible').type('webex');

            // * Verify no other plugins should be visible
            cy.get('#marketplaceTabs-pane-allPlugins').find('.more-modal__row').should('have.length', 1);

            // * Verify webex plugin should be visible
            cy.get('#marketplace-plugin-com\\.mattermost\\.webex').scrollIntoView().should('be.visible');

            // # Install the webex plugin
            cy.get('#marketplace-plugin-com\\.mattermost\\.webex').find('.btn.btn-primary').click();

            // * Verify should show "Configure" after installation
            cy.get('#marketplace-plugin-com\\.mattermost\\.webex').find('.btn.btn-outline', {timeout: TIMEOUTS.ONE_MIN}).scrollIntoView().should('be.visible').and('have.text', 'Configure');

            // * Verify search filter should be maintained
            cy.get('#marketplaceTabs-pane-allPlugins').find('.more-modal__row').should('have.length', 1);
        });

        it('should prompt to update an old GitHub plugin from all plugins', () => {
            // # Install GitHub 0.7.0 plugin
            cy.apiInstallPluginFromUrl('https://github.com/mattermost/mattermost-plugin-github/releases/download/v0.7.0/github-0.7.0.tar.gz', true);

            // # Scroll to GitHub plugin
            cy.get('#marketplace-plugin-github').scrollIntoView().should('be.visible');

            // * Verify github plugin should have update prompt
            cy.get('#marketplace-plugin-github').find('.update').should('be.visible').and('to.contain', 'Update available');

            // * Verify github plugin should have update link
            cy.get('#marketplace-plugin-github').find('.update b a').should('be.visible').and('have.text', 'Update');

            // # Update GitHub plugin
            cy.get('#marketplace-plugin-github .update b a').click();

            // * Verify confirmation modal should be visible
            cy.get('#confirmModal').should('be.visible');

            // # Confirm update
            cy.get('#confirmModal').find('.btn.btn-primary').click();

            // * Verify confirmation modal should not be visible
            cy.get('#confirmModal').should('not.be.visible');

            // * Verify github plugin update prompt should not be visible
            cy.get('#marketplace-plugin-github').find('.update').should('not.be.visible');

            // * Verify should show "Configure" after installation
            cy.get('#marketplace-plugin-github').find('.btn.btn-outline', {timeout: TIMEOUTS.ONE_MIN}).scrollIntoView().should('be.visible').and('have.text', 'Configure');

            // * Verify github plugin should still be visible
            cy.get('#marketplace-plugin-github').should('be.visible');
        });

        // This tests fails, if any plugins are previously installed. See https://mattermost.atlassian.net/browse/MM-21610
        it('change tab to "All Plugins" when "Install Plugins" link is clicked', () => {
            cy.get('#marketplaceTabs').scrollIntoView().should('be.visible').within(() => {
                // # Switch tab to installed plugin
                cy.findByText(/Installed/).should('be.visible').click();
                cy.findByText(/Installed/).should('have.attr', 'aria-selected', 'true');

                // * Verify installed plugins tab should be active
                cy.get('#marketplaceTabs-pane-installed').should('be.visible');
                cy.get('#marketplaceTabs-pane-allPlugins').should('not.exist');

                // # Click on Install Plugins should change current tab
                cy.findByText('Install Plugins').should('be.visible').click();

                // * Verify all plugins tab should be active
                cy.findByText('All Plugins').should('be.visible').should('have.attr', 'aria-selected', 'true');

                // * Verify all plugins pane should be active
                cy.get('#marketplaceTabs-pane-installed').should('not.exist');
                cy.get('#marketplaceTabs-pane-allPlugins').should('exist');
            });
        });

        // This test is disabled until the marketplace instance with support for labels is deployed.
        // This tests need to get updated when the labels send down from the Plugin Marketplace change.
        xit('should show OFFICIAL label for github plugin', () => {
            // # Scroll to GitHub plugin
            cy.get('#marketplace-plugin-github').scrollIntoView().should('be.visible');

            // * Verify OFFICIAL label is shown for github plugin
            cy.get('#marketplace-plugin-github').find('.tag').should('be.visible').and('to.contain', 'OFFICIAL').trigger('mouseover');

            // * Verify tooltip is shown after click the label
            cy.get('div.tooltip-inner').should('be.visible').and('contain', 'This plugin is maintained by Mattermost');
        });
    });

    describe('EnableRemoteMarketplace disabled, should', () => {
        beforeEach(() => {
            // # Enable Plugin Marketplace
            // # Disable Plugin Remote Marketplace
            // # Disable Automatic Prepackaged Plugins to make sure no plugins are loaded
            cy.apiUpdateConfig({
                PluginSettings: {
                    Enable: true,
                    EnableMarketplace: true,
                    EnableRemoteMarketplace: false,
                    AutomaticPrepackagedPlugins: false,
                },
            });

            // # Visit town-square channel
            cy.visit(townsquareLink);

            // # Click hamburger main menu
            cy.wait(TIMEOUTS.HALF_SEC).get('#sidebarHeaderDropdownButton').click();

            // # Open up marketplace modal
            cy.get('#marketplaceModal').click();
        });

        it('not display any plugins and no error bar', () => {
            // * Verify no plugins should be visible
            cy.get('#marketplaceTabs-pane-allPlugins').findByText('There are no plugins available at this time.');

            // * Verify no error bar should be visible
            cy.get('#error_bar').should('not.exist');
        });

        it('display installed plugins', () => {
            // # Install one plugin
            cy.apiInstallPluginFromUrl('https://github.com/mattermost/mattermost-plugin-github/releases/download/v0.7.0/github-0.7.0.tar.gz', true);

            // # Scroll to GitHub plugin
            cy.get('#marketplace-plugin-github').scrollIntoView().should('be.visible');

            // * Verify one local plugin should be installed
            cy.get('#marketplaceTabs-tab-installed').scrollIntoView().should('be.visible').click();
            cy.get('#marketplaceTabs-pane-installed').find('.more-modal__row').should('have.length', 1);

            // * Verify no error bar should be visible
            cy.get('#error_bar').should('not.exist');
        });
    });
});

function uninstallAllPlugins() {
    cy.apiGetAllPlugins().then(({plugins}) => {
        const {active, inactive} = plugins;
        inactive.forEach((plugin) => cy.apiRemovePluginById(plugin.id));
        active.forEach((plugin) => cy.apiRemovePluginById(plugin.id));
    });
}

function verifyPluginMarketplaceVisibility(shouldBeVisible) {
    cy.wait(TIMEOUTS.HALF_SEC).get('#lhsHeader').should('be.visible').within(() => {
        // # Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').click();

        // * Verify dropdown menu should be visible
        cy.get('.dropdown-menu').should('be.visible').within(() => {
            if (shouldBeVisible) {
                // * Verify Plugin Marketplace button should exist
                cy.findByText('Plugin Marketplace').should('exist');
            } else {
                // * Verify Plugin Marketplace button should not exist
                cy.findByText('Plugin Marketplace').should('not.exist');
            }
        });
    });
}
