// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @bot_accounts

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Bot accounts ownership and API', () => {
    let newTeam;
    let botName;
    let newUser;
    let newChannel;
    let newBot;

    beforeEach(() => {
        cy.apiAdminLogin();

        cy.apiInitSetup().then(({team, user, channel}) => {
            newTeam = team;
            newUser = user;
            newChannel = channel;
        });

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
        cy.apiCreateBot(botName, 'Test Bot', 'test bot').then(({bot}) => {
            newBot = bot;
            cy.apiPatchUserRoles(bot.user_id, ['system_admin', 'system_user']);
        });
    });

    it('MM-T1861 Bots do not re-enable if the owner is re-activated', () => {
        // # Create another admin account
        cy.apiCreateCustomAdmin().then(({sysadmin}) => {
            // # Login as the new admin
            cy.apiLogin(sysadmin);

            // # Create a new bot as the new admin
            const botName3 = 'stay-enabled-bot-' + Date.now();
            cy.apiCreateBot(botName3, 'Bot that should get disabled', 'hello bot');

            // # Login again as main admin
            cy.apiAdminLogin();

            // # Deactivate the newly created admin
            cy.apiDeactivateUser(sysadmin.id);

            // # Get bot list
            cy.visit(`/${newTeam.name}/integrations/bots`);

            // # Search for the other bot
            cy.get('#searchInput', {timeout: TIMEOUTS.ONE_MIN}).type(botName3);

            // * Validate that the plugin is disabled since it's owner is deactivate
            cy.get('.bot-list__disabled').scrollIntoView().should('be.visible');

            // # Re-activate the newly created admin
            cy.apiActivateUser(sysadmin.id);

            // # Repeat the test to confirm it stays disabled

            // # Get bot list
            cy.visit(`/${newTeam.name}/integrations/bots`);

            // # Search for the other bot
            cy.get('#searchInput', {timeout: TIMEOUTS.ONE_MIN}).type(botName3);

            // * Validate that the plugin is disabled even though it's owner is activate
            cy.get('.bot-list__disabled').scrollIntoView().should('be.visible');
        });
    });

    it('MM-T1862 Only system admin are able to create bots', () => {
        // # Login as admin
        cy.apiAdminLogin();

        cy.visit(`/${newTeam.name}/channels/town-square`);

        // # Open the menu
        cy.get('#lhsHeader', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').within(() => {
            cy.get('#sidebarHeaderDropdownButton').click();
            cy.get('.dropdown-menu').should('be.visible');

            // * Confirm integrations are visible
            cy.get('#integrations').should('be.visible');
        });

        // # Login as a regular user
        cy.apiLogin(newUser);

        cy.visit(`/${newTeam.name}/channels/town-square`);

        // # Open the menu
        cy.get('#lhsHeader', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').within(() => {
            cy.get('#sidebarHeaderDropdownButton').click();
            cy.get('.dropdown-menu').should('be.visible');

            // * Confirm integrations are not visible
            cy.get('#integrations').should('not.be.visible');
        });
    });

    it('MM-T1863 Only System Admin are able to create bots (API)', () => {
        // # Login as a regular user
        cy.apiLogin(newUser);

        // # Try to create a new bot as a regular user
        const botName3 = 'stay-enabled-bot-' + Date.now();

        cy.request({
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            url: '/api/v4/bots',
            method: 'POST',
            failOnStatusCode: false,
            body: {
                username: botName3,
                display_name: 'some text',
                description: 'some text',
            },
        }).then((response) => {
            // * Validate that request was denied
            expect(response.status).to.equal(403);
        });
    });

    it('MM-T1864 Create bot (API)', () => {
        // # Login as admin
        cy.apiAdminLogin();

        // # Create a new bot as the new admin
        const botName3 = 'stay-enabled-bot-' + Date.now();

        // * This call will fail if bot was not created
        cy.apiCreateBot(botName3, 'Bot that should get disabled', 'hello bot');
    });

    it('MM-T1865 Create post as bot', () => {
        // # Login as admin
        cy.apiAdminLogin();

        // # Create token for the bot
        cy.apiCreateToken(newBot.user_id).then(({token}) => {
            // # Logout to allow posting as bot
            cy.apiLogout();
            const msg1 = 'this is a bot message ' + botName;
            cy.apiCreatePost(newChannel.id, msg1, '', {attachments: [{pretext: 'Look some text', text: 'This is text'}]}, token);

            // # Re-login to validate post presence
            cy.apiAdminLogin();
            cy.visit(`/${newTeam.name}/channels/` + newChannel.name);

            // * Validate post was created
            cy.findByText(msg1).should('be.visible');
        });
    });

    it('MM-T1866 Create two posts in a row to the same channel', () => {
        // # Login as admin
        cy.apiAdminLogin();

        // # Create token for the bot
        cy.apiCreateToken(newBot.user_id).then(({token}) => {
            // # Logout to allow posting as bot
            cy.apiLogout();
            const msg1 = 'this is a bot message ' + botName;
            const msg2 = 'this is a bot message2 ' + botName;
            cy.apiCreatePost(newChannel.id, msg1, '', {attachments: [{pretext: 'Look some text', text: 'This is text'}]}, token).then(({body: post1}) => {
                cy.apiCreatePost(newChannel.id, msg2, '', {attachments: [{pretext: 'Look some text', text: 'This is text'}]}, token).then(({body: post2}) => {
                    // # Re-login to validate post presence
                    cy.apiAdminLogin();
                    cy.visit(`/${newTeam.name}/channels/` + newChannel.name);

                    // * Validate posts were created
                    cy.get(`#postMessageText_${post1.id}`, {timeout: TIMEOUTS.ONE_MIN}).should('contain', msg1);
                    cy.get(`#postMessageText_${post2.id}`, {timeout: TIMEOUTS.ONE_MIN}).should('contain', msg2);

                    // * Validate first post has an image
                    cy.get(`#post_${post1.id}`).find('.Avatar').should('be.visible');

                    // * Validate that the second one doesn't
                    cy.get(`#post_${post2.id}`).should('have.class', 'same--user');
                });
            });
        });
    });

    it('MM-T1867 Post as a bot and include an @ mention', () => {
        // # Login as admin
        cy.apiAdminLogin();

        // # Create token for the bot
        cy.apiCreateToken(newBot.user_id).then(({token}) => {
            // # Logout to allow posting as bot
            cy.apiLogout();
            const msg1 = 'this is a bot message ' + botName;
            cy.apiCreatePost(newChannel.id, msg1 + ' to @sysadmin', '', {}, token);

            // # Re-login to validate post presence
            cy.apiAdminLogin();
            cy.visit(`/${newTeam.name}/channels/` + newChannel.name);

            cy.getLastPostId().then((postId) => {
                // * Validate post was created
                cy.get(`#postMessageText_${postId}`, {timeout: TIMEOUTS.ONE_MIN}).should('contain', msg1);

                // * Assert that the last message posted contains highlighted mention
                cy.get(`#postMessageText_${postId}`, {timeout: TIMEOUTS.ONE_MIN}).find('.mention--highlight').should('be.visible');
            });
        });
    });

    it('MM-T1868 BOT has a member role and is not in target channel and team', () => {
        // # Login as admin
        cy.apiAdminLogin();
        const botName3 = 'stay-enabled-bot-' + Date.now();

        // # Create a test bot (member)
        cy.apiCreateBot(botName3, 'Test Bot', 'test bot').then(({bot}) => {
            // # Create token for the bot
            cy.apiCreateToken(bot.user_id).then(({token}) => {
                // # Logout to allow posting as bot
                cy.apiLogout();

                // # Try posting
                cy.apiCreatePost(newChannel.id, 'this is a bot message ' + botName3, '', {}, token, false).then((response) => {
                    // * Validate that posting was not allowed
                    expect(response.status).to.equal(403);
                });
            });
        });
    });

    it('MM-T1869 BOT has a system admin role and is not in target channel and team', () => {
        // # Login as admin
        cy.apiAdminLogin();
        const botName3 = 'stay-enabled-bot-' + Date.now();

        // # Create token for the bot
        cy.apiCreateToken(newBot.user_id).then(({token}) => {
            // # Logout to allow posting as bot
            cy.apiLogout();

            // # Try posting
            cy.apiCreatePost(newChannel.id, 'this is a bot message ' + botName3, '', {}, token).then((response) => {
                // * Validate that posting was allowed
                expect(response.status).to.equal(201);
            });
        });
    });

    it('MM-T1870 BOT has a system admin role and can also post to private channels they do not belong to', () => {
        // # Login as admin
        cy.apiAdminLogin();

        const channelName = 'channel' + Date.now();

        // # Create private channel that bot doesn't belong to
        cy.apiCreateChannel(newTeam.id, channelName, channelName, 'P').then(({channel}) => {
            // # Create token for the bot
            cy.apiCreateToken(newBot.user_id).then(({token}) => {
                // # Logout to allow posting as bot
                cy.apiLogout();
                const msg1 = 'this is a bot message ' + botName;

                // # Create a post
                cy.apiCreatePost(channel.id, msg1 + ' to @sysadmin', '', {}, token);

                // # Re-login to validate post presence
                cy.apiAdminLogin();
                cy.visit(`/${newTeam.name}/channels/` + channel.name);

                cy.getLastPostId().then((postId) => {
                    // * Validate post was created
                    cy.get(`#postMessageText_${postId}`, {timeout: TIMEOUTS.ONE_MIN}).should('contain', msg1);
                });
            });
        });
    });
});
