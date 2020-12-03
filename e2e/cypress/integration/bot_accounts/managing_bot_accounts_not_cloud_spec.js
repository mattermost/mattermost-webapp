// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @not_cloud @bot_accounts

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Managing bot accounts', () => {
    let newTeam;

    before(() => {
        cy.shouldNotRunOnCloudEdition();
    });

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.shouldHavePluginUploadEnabled();

        // # Set ServiceSettings to expected values
        const newSettings = {
            ServiceSettings: {
                EnableBotAccountCreation: true,
            },
            PluginSettings: {
                Enable: true,
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Create a test bot
        cy.apiCreateBot({prefix: 'test-bot'});

        // # Create and visit new channel
        cy.apiInitSetup().then(({team}) => {
            newTeam = team;
        });
    });

    it('MM-T1853 Bots managed plugins can be created when Enable Bot Account Creation is set to false', () => {
        // # Visit bot config
        cy.visit('/admin_console/integrations/bot_accounts');

        // # Click 'false' to disable
        cy.findByTestId('ServiceSettings.EnableBotAccountCreationfalse', {timeout: TIMEOUTS.ONE_MIN}).click();

        // # Save
        cy.findByTestId('saveSetting').should('be.enabled').click();

        // # Try to remove the plugin, just in case
        cy.apiRemovePluginById('com.github.matterpoll.matterpoll');

        // # Upload and enable "matterpoll" plugin
        cy.apiUploadPlugin('com.github.matterpoll.matterpoll.tar.gz').then(() => {
            cy.apiEnablePluginById('com.github.matterpoll.matterpoll');
        });

        // # Visit the integrations
        cy.visit(`/${newTeam.name}/integrations/bots`);

        // * Validate that plugin installed ok
        cy.contains('Matterpoll (@matterpoll)', {timeout: TIMEOUTS.ONE_MIN});
    });

    it('MM-T1859 Bot is kept active when owner is disabled', () => {
        // # Visit bot config
        cy.visit('/admin_console/integrations/bot_accounts');

        // # Click 'false' to disable
        cy.findByTestId('ServiceSettings.DisableBotsWhenOwnerIsDeactivatedfalse', {timeout: TIMEOUTS.ONE_MIN}).click();

        // # Save
        cy.findByTestId('saveSetting').should('be.enabled').click();

        // # Create another admin account
        cy.apiCreateCustomAdmin().then(({sysadmin}) => {
            // # Login as the new admin
            cy.apiLogin(sysadmin);

            // # Create a new bot as the new admin
            cy.apiCreateBot({prefix: 'stay-enabled-bot'}).then(({bot}) => {
                // # Login again as main admin
                cy.apiAdminLogin();

                // # Deactivate the newly created admin
                cy.apiDeactivateUser(sysadmin.id);

                // # Get bot list
                cy.visit(`/${newTeam.name}/integrations/bots`);

                // # Search for the other bot
                cy.get('#searchInput', {timeout: TIMEOUTS.ONE_MIN}).type(bot.display_name);

                // * Validate that the plugin is still active, even though its owner is disabled
                cy.get('.bot-list__disabled').should('not.be.visible');
                cy.findByText(bot.fullDisplayName).scrollIntoView().should('be.visible');

                cy.visit(`/${newTeam.name}/messages/@sysadmin`);

                // # Get last post message text
                cy.getLastPostId().then((postId) => {
                    cy.get(`#postMessageText_${postId}`).as('postMessageText');
                });

                // * Verify entire message
                cy.get('@postMessageText').
                    should('be.visible').
                    and('contain.text', `${sysadmin.username} was deactivated. They managed the following bot accounts`).
                    and('contain.text', bot.username);
            });
        });
    });
});
