// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @bot_accounts

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Managing bot accounts', () => {
    let newTeam;
    let botName;

    beforeEach(() => {
        cy.apiAdminLogin();
        botName = 'bot-' + Date.now();

        // # Set ServiceSettings to expected values
        const newSettings = {
            ServiceSettings: {
                EnableBotAccountCreation: true,
                DisableBotsWhenOwnerIsDeactivated: true,
            },
            PluginSettings: {
                Enable: true,
                RequirePluginSignature: false,
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Create a test bot
        cy.apiCreateBot(botName, 'Test Bot', 'test bot');

        // # Create and visit new channel
        cy.apiInitSetup().then(({team}) => {
            newTeam = team;
        });
    });

    it('MM-T1851 No option to create BOT accounts when Enable Bot Account Creation is set to False.', () => {
        // # Visit bot config
        cy.visit('/admin_console/integrations/bot_accounts');

        // # Click 'false' to disable
        cy.findByTestId('ServiceSettings.EnableBotAccountCreationfalse', {timeout: TIMEOUTS.ONE_MIN}).click();

        // # Save
        cy.findByTestId('saveSetting').should('be.enabled').click();

        // # Visit the integrations
        cy.visit(`/${newTeam.name}/integrations/bots`);

        // * Assert that adding bots is not possible
        cy.get('#addBotAccount', {timeout: TIMEOUTS.ONE_MIN}).should('not.be.visible');
    });

    it('MM-T1852 Bot creation via API is not permitted when Enable Bot Account Creation is set to False', () => {
        // # Visit bot config
        cy.visit('/admin_console/integrations/bot_accounts');

        // # Click 'false' to disable
        cy.findByTestId('ServiceSettings.EnableBotAccountCreationfalse', {timeout: TIMEOUTS.ONE_MIN}).click();

        // # Save
        cy.findByTestId('saveSetting').should('be.enabled').click();

        // * Validate that creating bot fails

        cy.request({
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            url: '/api/v4/bots',
            method: 'POST',
            failOnStatusCode: false,
            body: {
                username: 'bot-' + Date.now(),
                display_name: 'test bot',
                description: 'test bot',
            },
        }).then((response) => {
            expect(response.status).to.equal(403);
            expect(response.body.message).to.equal('Bot creation has been disabled.');
            return cy.wrap(response);
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

    it('MM-T1854 Bots can be create when Enable Bot Account Creation is set to True.', () => {
        // # Visit bot config
        cy.visit('/admin_console/integrations/bot_accounts');

        // * Check that creation is enabled
        cy.findByTestId('ServiceSettings.EnableBotAccountCreationtrue', {timeout: TIMEOUTS.ONE_MIN}).should('be.checked');

        // # Visit the integrations
        cy.visit(`/${newTeam.name}/integrations/bots`);

        // * Assert that adding bots is possible
        cy.get('#addBotAccount', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    });

    it('MM-T1856 Disable Bot', () => {
        // # Visit the integrations
        cy.visit(`/${newTeam.name}/integrations/bots`);

        // # Filter bot
        cy.get('#searchInput', {timeout: TIMEOUTS.ONE_MIN}).type(`${botName}`);

        // * Check that the previously created bot is listed
        cy.findByText(`Test Bot (@${botName})`, {timeout: TIMEOUTS.ONE_MIN}).scrollIntoView().then((el) => {
            // # Click the disable button
            cy.wrap(el[0].parentElement.parentElement).find('button:nth-child(3)').should('be.visible').click();
        });

        // * Check that the bot is in the 'disabled' section
        cy.get('.bot-list__disabled').scrollIntoView().findByText(`Test Bot (@${botName})`).should('be.visible');
    });

    it('MM-T1857 Enable Bot', () => {
        // # Visit the integrations
        cy.visit(`/${newTeam.name}/integrations/bots`);

        // * Check that the previously created bot is listed
        cy.findByText(`Test Bot (@${botName})`, {timeout: TIMEOUTS.ONE_MIN}).scrollIntoView().then((el) => {
            // # Click the disable button
            cy.wrap(el[0].parentElement.parentElement).find('button:nth-child(3)').should('be.visible').click();
        });

        // # Filter bot
        cy.get('#searchInput', {timeout: TIMEOUTS.ONE_MIN}).type(`${botName}`);

        // # Re-enable the bot
        cy.get('.bot-list__disabled').scrollIntoView().findByText(`Test Bot (@${botName})`, {timeout: TIMEOUTS.ONE_MIN}).scrollIntoView().then((el) => {
            // # Click the enable button
            cy.wrap(el[0].parentElement.parentElement).find('button:nth-child(1)').should('be.visible').click();
        });

        // * Check that the bot is in the 'enabled' section
        cy.findByText(`Test Bot (@${botName})`).scrollIntoView().should('be.visible');
        cy.get('.bot-list__disabled').should('not.be.visible');
    });

    it('MM-T1858 Search active and disabled Bot accounts', () => {
        const botName2 = 'hello-bot-' + Date.now();
        cy.apiCreateBot(botName2, 'Hello Bot', 'hello bot');

        // # Visit the integrations
        cy.visit(`/${newTeam.name}/integrations/bots`);

        // * Check that the previously created bot is listed
        cy.findByText(`Hello Bot (@${botName2})`, {timeout: TIMEOUTS.ONE_MIN}).then((el) => {
            // # Make sure it's on the screen
            cy.wrap(el[0].parentElement.parentElement).scrollIntoView();

            // # Click the disable button
            cy.wrap(el[0].parentElement.parentElement).find('button:nth-child(3)').should('be.visible').click();
        });

        // * Validate that disabled section appears
        cy.get('.bot-list__disabled').scrollIntoView().should('be.visible');

        // # Search for the other bot
        cy.get('#searchInput').type('Test Bot');

        // * Validate that disabled section disappears
        cy.get('.bot-list__disabled').should('not.be.visible');
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
            const botName3 = 'stay-enabled-bot-' + Date.now();
            cy.apiCreateBot(botName3, 'Bot That Stays Enabled', 'hello bot');

            // # Login again as main admin
            cy.apiAdminLogin();

            // # Deactivate the newly created admin
            cy.apiDeactivateUser(sysadmin.id);

            // # Get bot list
            cy.visit(`/${newTeam.name}/integrations/bots`);

            // # Search for the other bot
            cy.get('#searchInput', {timeout: TIMEOUTS.ONE_MIN}).type('Bot That Stays Enabled');

            // * Validate that the plugin is still active, even though it's owner is disabled
            cy.get('.bot-list__disabled').should('not.be.visible');
            cy.findByText(`Bot That Stays Enabled (@${botName3})`).scrollIntoView().should('be.visible');

            cy.visit(`/${newTeam.name}/messages/@sysadmin`);

            // # Get last post message text
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).as('postMessageText');
            });

            // * Verify entire message
            cy.get('@postMessageText').
                should('be.visible').
                and('contain.text', `${sysadmin.username} was deactivated. They managed the following bot accounts`).
                and('contain.text', botName3);
        });
    });

    it('MM-T1860 Bot is disabled when owner is deactivated', () => {
        // # Create another admin account
        cy.apiCreateCustomAdmin().then(({sysadmin}) => {
            // # Login as the new admin
            cy.apiLogin(sysadmin);

            // # Create a new bot as the new admin
            const botName3 = 'stay-enabled-bot-' + Date.now();
            cy.apiCreateBot(botName3, 'Bot That Stays Enabled', 'hello bot');

            // # Login again as main admin
            cy.apiAdminLogin();

            // # Deactivate the newly created admin
            cy.apiDeactivateUser(sysadmin.id);

            // # Get bot list
            cy.visit(`/${newTeam.name}/integrations/bots`);

            // # Search for the other bot
            cy.get('#searchInput', {timeout: TIMEOUTS.ONE_MIN}).type('Bot That Stays Enabled');

            // * Validate that the plugin is disabled since it's owner is deactivate
            cy.get('.bot-list__disabled').scrollIntoView().findByText(`Bot That Stays Enabled (@${botName3})`).scrollIntoView().should('be.visible');

            cy.visit(`/${newTeam.name}/messages/@sysadmin`);

            // # Get last post message text
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`).as('postMessageText');
            });

            // * Verify entire message
            cy.get('@postMessageText').
                should('be.visible').
                and('contain.text', `${sysadmin.username} was deactivated. They managed the following bot accounts`).
                and('contain.text', botName3);
        });
    });
});
