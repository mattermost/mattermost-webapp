// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Plugin Marketplace', () => {
    after(() => {
        // # Restore default configuration
        const newSettings = {
            PluginSettings: {
                Enable: true,
                EnableMarketplace: true,
                EnableRemoteMarketplace: true,
                MarketplaceUrl: 'https://api.integrations.mattermost.com',
            },
        };
        cy.apiUpdateConfig(newSettings);
    });

    describe('should not render in main menu', () => {
        afterEach(() => {
            cy.get('#lhsHeader').should('be.visible').within(() => {
                // # Click hamburger main menu
                cy.get('#sidebarHeaderDropdownButton').click();

                // * Dropdown menu should be visible
                cy.get('.dropdown-menu').should('be.visible').within(() => {
                    // * Plugin Marketplace button should not be visible
                    cy.findByText('Plugin Marketplace').should('not.be.visible');
                });
            });
        });

        it('for non-admin', () => {
            // # Configure marketplace as enabled
            const newSettings = {
                PluginSettings: {
                    Enable: true,
                    EnableMarketplace: true,
                    MarketplaceUrl: 'https://api.integrations.mattermost.com',
                },
            };
            cy.apiUpdateConfig(newSettings);

            // # Login as non admin user
            cy.apiLogin('user-1');
            cy.visit('/');
        });

        it('when marketplace disabled', () => {
            // # Configure marketplace as disabled
            const newSettings = {
                PluginSettings: {
                    Enable: true,
                    EnableMarketplace: false,
                    MarketplaceUrl: 'https://api.integrations.mattermost.com',
                },
            };
            cy.apiUpdateConfig(newSettings);

            // # Login as sysadmin
            cy.apiLogin('sysadmin');
            cy.visit('/');
        });

        it('when plugins disabled', () => {
            // # Configure plugins as disabled
            const newSettings = {
                PluginSettings: {
                    Enable: false,
                    EnableMarketplace: true,
                    MarketplaceUrl: 'https://api.integrations.mattermost.com',
                },
            };
            cy.apiUpdateConfig(newSettings);

            // # Login as sysadmin
            cy.apiLogin('sysadmin');
            cy.visit('/');
        });
    });
    describe('invalid marketplace, should', () => {
        before(() => {
            // # Set ServiceSettings to expected values
            const newSettings = {
                PluginSettings: {
                    Enable: true,
                    EnableMarketplace: true,
                    EnableRemoteMarketplace: true,
                    MarketplaceUrl: 'example.com',
                },
            };
            cy.apiUpdateConfig(newSettings);
        });

        beforeEach(() => {
            // # Login as sysadmin
            cy.apiLogin('sysadmin');

            // # Go to main channel
            cy.visit('/');

            cy.wait(TIMEOUTS.TINY).get('#lhsHeader').should('be.visible').within(() => {
                // # Click hamburger main menu
                cy.get('#sidebarHeaderDropdownButton').click();

                // * Dropdown menu should be visible
                cy.get('.dropdown-menu').should('be.visible').within(() => {
                    // * Plugin Marketplace button should be visible then click
                    cy.findByText('Plugin Marketplace').should('be.visible').click();
                });
            });
        });

        afterEach(() => {
            // * cleanup installed plugins
            uninstallAllPlugins();
        });

        it('render an error bar', () => {
            // * Should be an error connecting to the marketplace server
            cy.get('#error_bar').contains('Error connecting to the marketplace server');
        });
        it('show an error bar on failing to filter', () => {
            // # Set ServiceSettings to expected values
            const newSettings = {
                PluginSettings: {
                    Enable: true,
                    EnableMarketplace: true,
                    MarketplaceUrl: 'example.com',
                },
            };
            cy.apiUpdateConfigBasic(newSettings);

            // # filter to jira plugin only
            cy.get('#searchMarketplaceTextbox').type('jira', {force: true});

            // * Should be an error connecting to the marketplace server
            cy.get('#error_bar').contains('Error connecting to the marketplace server');
        });

        it('display installed plugins and error bar', () => {
            // * install one plugin
            cy.installPluginFromUrl('https://github.com/mattermost/mattermost-plugin-github/releases/download/v0.7.0/github-0.7.0.tar.gz', true);

            // * one local plugin should be visible
            cy.get('#marketplaceTabs-pane-allPlugins').find('.more-modal__row').should('have.length', 1);

            // * Should be an error connecting to the marketplace server
            cy.get('#error_bar').contains('Error connecting to the marketplace server');
        });
    });

    describe('should', () => {
        beforeEach(() => {
            // # Configure marketplace as enabled, and GitHub plugin as disabled.
            const newSettings = {
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
            };
            cy.apiUpdateConfig(newSettings);

            // # Login as sysadmin
            cy.apiLogin('sysadmin');
            cy.visit('/');

            cy.wait(TIMEOUTS.TINY).get('#lhsHeader').should('be.visible').within(() => {
                // # Click hamburger main menu
                cy.get('#sidebarHeaderDropdownButton').click();

                // * Dropdown menu should be visible
                cy.get('.dropdown-menu').should('be.visible').within(() => {
                    // * Plugin Marketplace button should be visible then click
                    cy.findByText('Plugin Marketplace').should('be.visible').click();
                });
            });

            // * error bar should not be visible
            cy.get('#error_bar').should('not.be.visible');

            // * search should be visible
            cy.findByPlaceholderText('Search Plugins').should('be.visible').click();

            // * tabs should be visible
            cy.get('#marketplaceTabs').should('exist');

            // * all plugins tab button should be visible
            cy.get('#marketplaceTabs-tab-allPlugins').should('be.visible');

            // * installed plugins tabs button should be visible
            cy.get('#marketplaceTabs-tab-installed').should('be.visible');
        });

        afterEach(() => {
            // * cleanup installed plugins
            uninstallAllPlugins();
        });

        it('autofocus on search plugin input box', () => {
            cy.findByPlaceholderText('Search Plugins').scrollIntoView().should('be.focused');
        });
        it('render the list of all plugins by default', () => {
            // * all plugins tab should be active
            cy.get('#marketplaceTabs-pane-allPlugins').should('exist');

            // * installed plugins tab should not be active
            cy.get('#marketplaceTabs-pane-installed').should('not.exist');
        });

        // this test uses exist, not visible, due to issues with Cypress
        it('render the list of installed plugins on demand', () => {
            // # click on installed plugins tab
            cy.get('#marketplaceTabs-tab-installed').scrollIntoView().click();

            // * all plugins tab should not be active
            cy.get('#marketplaceTabs-pane-allPlugins').should('not.exist');

            // * installed plugins tab should exist
            cy.get('#marketplaceTabs-pane-installed').should('exist');
        });

        it('should close the modal on demand', () => {
            // # close marketplace modal
            cy.get('#closeIcon').click();

            // * marketplace should not be visible
            cy.get('#modal_marketplace').should('not.be.visible');
        });

        it('should filter all on search', () => {
            // # filter to jira plugin only
            cy.findByPlaceholderText('Search Plugins').scrollIntoView().should('be.visible').type('jira');

            // * jira plugin should be visible
            cy.get('#marketplace-plugin-jira').should('be.visible');

            // * no other plugins should be visible
            cy.get('#marketplaceTabs-pane-allPlugins').find('.more-modal__row').should('have.length', 1);
        });

        it('should show an error bar on failing to filter', () => {
            // # Set ServiceSettings to expected values
            const newSettings = {
                PluginSettings: {
                    Enable: true,
                    EnableMarketplace: true,
                    MarketplaceUrl: 'example.com',
                },
            };
            cy.apiUpdateConfigBasic(newSettings);

            // # filter to jira plugin only
            cy.findByPlaceholderText('Search Plugins').should('be.visible').type('jira');

            // * Should be an error connecting to the marketplace server
            cy.get('#error_bar').contains('Error connecting to the marketplace server');
        });

        it('should install a plugin on demand', () => {
            // # uninstall any existing webex plugin
            cy.uninstallPluginById('com.mattermost.webex');

            // * webex plugin should be visible
            cy.get('#marketplace-plugin-com\\.mattermost\\.webex').scrollIntoView().should('be.visible');

            // # install the webex plugin
            cy.get('#marketplace-plugin-com\\.mattermost\\.webex').find('.btn.btn-primary').click();

            // * should show "Configure" after installation
            cy.get('#marketplace-plugin-com\\.mattermost\\.webex').find('.btn.btn-outline', {timeout: 60000}).should('be.visible').and('have.text', 'Configure');
        });

        it('should install a plugin from search results on demand', () => {
            // # uninstall any existing webex plugin
            cy.uninstallPluginById('com.mattermost.webex');

            // # filter to webex plugin only
            cy.findByPlaceholderText('Search Plugins').should('be.visible').type('webex');

            // * no other plugins should be visible
            cy.get('#marketplaceTabs-pane-allPlugins').find('.more-modal__row').should('have.length', 1);

            // * webex plugin should be visible
            cy.get('#marketplace-plugin-com\\.mattermost\\.webex').scrollIntoView().should('be.visible');

            // # install the webex plugin
            cy.get('#marketplace-plugin-com\\.mattermost\\.webex').find('.btn.btn-primary').click();

            // * should show "Configure" after installation
            cy.get('#marketplace-plugin-com\\.mattermost\\.webex').find('.btn.btn-outline', {timeout: 60000}).should('be.visible').and('have.text', 'Configure');

            // * search filter should be maintained
            cy.get('#marketplaceTabs-pane-allPlugins').find('.more-modal__row').should('have.length', 1);
        });

        it('should prompt to update an old GitHub plugin from all plugins', () => {
            // # Install GitHub 0.7.0 plugin
            cy.installPluginFromUrl('https://github.com/mattermost/mattermost-plugin-github/releases/download/v0.7.0/github-0.7.0.tar.gz', true);

            // # Scroll to GitHub plugin
            cy.get('#marketplace-plugin-github').scrollIntoView().should('be.visible');

            // * github plugin should have update prompt
            cy.get('#marketplace-plugin-github').find('.update').should('be.visible').and('to.contain', 'Update available');

            // * github plugin should have update link
            cy.get('#marketplace-plugin-github').find('.update b a').should('be.visible').and('have.text', 'Update');

            // # update GitHub plugin
            cy.get('#marketplace-plugin-github .update b a').click();

            // * confirmation modal should be visible
            cy.get('#confirmModal').should('be.visible');

            // # confirm update
            cy.get('#confirmModal').find('.btn.btn-primary').click();

            // * confirmation modal should not be visible
            cy.get('#confirmModal').should('not.be.visible');

            // * github plugin update prompt should not be visible
            cy.get('#marketplace-plugin-github').find('.update').should('not.be.visible');

            // * should show "Configure" after installation
            cy.get('#marketplace-plugin-github').find('.btn.btn-outline', {timeout: 60000}).should('be.visible').and('have.text', 'Configure');

            // * github plugin should still be visible
            cy.get('#marketplace-plugin-github').should('be.visible');
        });

        // This tests fails, if any plugins are previously installed. See https://mattermost.atlassian.net/browse/MM-21610
        it('change tab to "All Plugins" when "Install Plugins" link is clicked', () => {
            cy.get('#marketplaceTabs').should('exist').within(() => {
                // # switch tab to installed plugin
                cy.findByText(/Installed/).should('be.visible').click();
                cy.findByText(/Installed/).should('have.attr', 'aria-selected', 'true');

                // * installed plugins tab should be active
                cy.get('#marketplaceTabs-pane-installed').should('be.visible');
                cy.get('#marketplaceTabs-pane-allPlugins').should('not.exist');

                // # click on Install Plugins should change current tab
                cy.findByText('Install Plugins').should('be.visible').click();

                // * all plugins tab should be active
                cy.findByText('All Plugins').should('be.visible').should('have.attr', 'aria-selected', 'true');

                // * all plugins pane should be active
                cy.get('#marketplaceTabs-pane-installed').should('not.exist');
                cy.get('#marketplaceTabs-pane-allPlugins').should('exist');
            });
        });

        // This test is disabled until the marketplace instance with support for labels is deployed.
        // This tests need to get updated when the labels send down from the Plugin Marketplace change.
        xit('should show OFFICIAL label for github plugin', () => {
            // # Scroll to GitHub plugin
            cy.get('#marketplace-plugin-github').scrollIntoView().should('be.visible');

            // * OFFICIAL label is shown for github plugin
            cy.get('#marketplace-plugin-github').find('.tag').should('be.visible').and('to.contain', 'OFFICIAL').trigger('mouseover');

            // * Tooltip is shown after click the label
            cy.get('div.tooltip-inner').should('be.visible').and('contain', 'This plugin is maintained by Mattermost');
        });
    });

    describe('EnableRemoteMarketplace disabled, should', () => {
        beforeEach(() => {
            const newSettings = {
                PluginSettings: {
                    Enable: true,
                    EnableMarketplace: true,
                    EnableRemoteMarketplace: false,
                    MarketplaceUrl: 'https://api.integrations.mattermost.com',
                },
            };
            cy.apiUpdateConfig(newSettings);

            // # Login as sysadmin
            cy.apiLogin('sysadmin');
            cy.visit('/');

            // # Click hamburger main menu
            cy.wait(TIMEOUTS.TINY).get('#sidebarHeaderDropdownButton').click();

            // # Open up marketplace modal
            cy.get('#marketplaceModal').click();
        });

        it('not display any plugins and no error bar', () => {
            // * no plugins should be visible
            cy.get('#marketplaceTabs-pane-allPlugins').findByText('There are no plugins available at this time.');

            // * no error bar should be visible
            cy.get('#error_bar').should('not.exist');
        });

        it('display installed plugins', () => {
            // * install one plugin
            cy.installPluginFromUrl('https://github.com/mattermost/mattermost-plugin-github/releases/download/v0.7.0/github-0.7.0.tar.gz', true);

            // * one local plugin should be visible
            cy.get('#marketplaceTabs-pane-allPlugins').find('.more-modal__row').should('have.length', 1);

            // * no error bar should be visible
            cy.get('#error_bar').should('not.exist');
        });
    });

    function uninstallAllPlugins() {
        cy.getAllPlugins().then((response) => {
            const {active, inactive} = response.body;
            inactive.forEach((plugin) => cy.uninstallPluginById(plugin.id));
            active.forEach((plugin) => cy.uninstallPluginById(plugin.id));
        });
    }
});
