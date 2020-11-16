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
    let adminUser;
    beforeEach(() => {
        cy.apiAdminLogin().then(({user}) => {
            adminUser = user;
        });

        cy.apiInitSetup().then(({team, user, channel}) => {
            newTeam = team;
            newUser = user;
            newChannel = channel;
        });

        botName = 'bot-' + Date.now();

        // # Set ServiceSettings to expected values
        const newSettings = {
            ServiceSettings: {
                EnforceMultifactorAuthentication: false,
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

    it('MM-T1872 Bot can post to DM channel', () => {
        // # Create DM channel that bot doesn't belong to
        cy.apiCreateDirectChannel([newUser.id, adminUser.id]).then(({channel}) => {
            // # Create token for the bot
            cy.apiAccessToken(newBot.user_id, 'some text').then(({token}) => {
                const msg1 = 'this is a bot message ' + botName;

                // # Post test message
                cy.postBotMessage({message: msg1, token, channelId: channel.id});

                // # Validate post presence
                cy.visit(`/${newTeam.name}/channels/` + channel.name);

                cy.getLastPostId().then((postId) => {
                    // * Validate post was created
                    cy.get(`#postMessageText_${postId}`, {timeout: TIMEOUTS.ONE_MIN}).should('contain', msg1);
                });
            });
        });
    });

    it('MM-T1874 Bots can post when MFA is enforced', () => {
        // # Create token for the bot
        cy.apiAccessToken(newBot.user_id, 'some text').then(({token}) => {
            const msg1 = 'this is a bot message ' + botName;
            cy.postBotMessage({channelId: newChannel.id, message: msg1, props: {attachments: [{pretext: 'Look some text', text: 'This is text'}]}, token});

            // # Visit test channel
            cy.visit(`/${newTeam.name}/channels/` + newChannel.name);

            // * Validate post was created
            cy.findByText(msg1).should('be.visible');

            const newSettings = {
                ServiceSettings: {
                    EnforceMultifactorAuthentication: true,
                },
            };
            cy.apiUpdateConfig(newSettings);

            const msg2 = 'this is a bot message2 ' + botName;
            cy.postBotMessage({channelId: newChannel.id, message: msg2, props: {attachments: [{pretext: 'Look some text', text: 'This is text'}]}, token});

            cy.visit(`/${newTeam.name}/channels/` + newChannel.name);

            // * Validate post was created
            cy.findByText(msg2).should('be.visible');
        });
    });

    it('MM-T1875 Bots cannot create another bot', () => {
        // # Create token for the bot
        cy.apiAccessToken(newBot.user_id, 'some text').then(({token}) => {
            // # Logout to allow posting as bot
            cy.apiLogout();

            // # Try to create a new bot
            cy.request({
                headers: {'X-Requested-With': 'XMLHttpRequest', Authorization: `Bearer ${token}`},
                url: '/api/v4/bots',
                method: 'POST',
                failOnStatusCode: false,
                body: {
                    username: botName + '333',
                    display_name: 'some text',
                    description: 'some text',
                },
            }).then((response) => {
                // * Validate that request was denied
                expect(response.status).to.equal(403);
            });
        });
    });

    it('MM-T1877 Reactivate a deactivated bot', () => {
        // # Create private channel that bot doesn't belong to
        cy.apiCreateDirectChannel([newUser.id, adminUser.id]).then(({channel}) => {
            // # Create token for the bot
            cy.apiAccessToken(newBot.user_id, 'some text').then(({token}) => {
                const msg1 = 'this is a bot message ' + botName;

                // # Create a post
                cy.postBotMessage({channelId: channel.id, message: msg1, token});

                cy.visit(`/${newTeam.name}/channels/` + channel.name);

                cy.getLastPostId().then((postId) => {
                    // * Validate post was created
                    cy.get(`#postMessageText_${postId}`, {timeout: TIMEOUTS.ONE_MIN}).should('contain', msg1);
                });

                // # Disable the bot
                cy.visit(`/${newTeam.name}/integrations/bots`);

                cy.findByText(`Test Bot (@${botName})`).scrollIntoView().parent().findByText('Disable').click();

                // # Try to post again
                const msg2 = 'this is a bot message2 ' + botName;

                // # Logout to allow posting as bot
                cy.apiLogout();

                // # Create a post
                cy.postBotMessage({channelId: channel.id, message: msg2, token, failOnStatus: false}).then(({status}) => {
                    // * Validate that posting failed
                    expect(status, 403);
                });

                cy.apiAdminLogin();

                // # Enable the bot again
                cy.visit(`/${newTeam.name}/integrations/bots`);
                cy.findByText(`Test Bot (@${botName})`).scrollIntoView().parent().findByText('Enable').click();

                // # Try to post again

                // * Validate that posting works
                cy.postBotMessage({channelId: channel.id, message: msg2, token});

                // * Validate post presence
                cy.visit(`/${newTeam.name}/channels/` + channel.name);

                cy.getLastPostId().then((postId) => {
                    // * Validate post was created
                    cy.get(`#postMessageText_${postId}`, {timeout: TIMEOUTS.ONE_MIN}).should('contain', msg2);
                });
            });
        });
    });

    it('MM-T1878 Disable token can not be used to post', () => {
        // # Create DM channel that bot doesn't belong to
        cy.apiCreateDirectChannel([newUser.id, adminUser.id]).then(({channel}) => {
            // # Create token for the bot
            cy.apiAccessToken(newBot.user_id, 'some text').then(({token, id}) => {
                const msg1 = 'this is a bot message ' + botName;

                // # Create a post
                cy.postBotMessage({channelId: channel.id, message: msg1, token});

                // # Validate post presence
                cy.visit(`/${newTeam.name}/channels/` + channel.name);

                cy.getLastPostId().then((postId) => {
                    // * Validate post was created
                    cy.get(`#postMessageText_${postId}`, {timeout: TIMEOUTS.ONE_MIN}).should('contain', msg1);
                });

                // # Disable the bot token
                cy.visit(`/${newTeam.name}/integrations/bots`);

                cy.findByText(`Test Bot (@${botName})`).then((el) => {
                    // # Make sure it's on the screen
                    cy.wrap(el[0].parentElement.parentElement).scrollIntoView();
                    cy.get(`[name="${id}_deactivate"]`).click();
                });

                // # Try to post again
                const msg2 = 'this is a bot message2 ' + botName;

                // # Create a post
                cy.postBotMessage({channelId: channel.id, message: msg2, token, failOnStatus: false}).then(({status}) => {
                    // * Validate that posting failed
                    expect(status, 403);
                });

                // # Enable the bot token again
                cy.visit(`/${newTeam.name}/integrations/bots`);

                cy.findByText(`Test Bot (@${botName})`).then((el) => {
                    // # Make sure it's on the screen
                    cy.wrap(el[0].parentElement.parentElement).scrollIntoView();
                    cy.get(`[name="${id}_activate"]`).click();
                });

                // # Try to post again
                // * Validate that posting works
                cy.postBotMessage({channelId: channel.id, message: msg2, token});

                // # Validate post presence
                cy.visit(`/${newTeam.name}/channels/` + channel.name);

                cy.getLastPostId().then((postId) => {
                    // * Validate post was created
                    cy.get(`#postMessageText_${postId}`, {timeout: TIMEOUTS.ONE_MIN}).should('contain', msg2);
                });
            });
        });
    });

    it('MM-T1880 Deleted token can not be used to post', () => {
        // # Create private channel that bot doesn't belong to
        cy.apiCreateDirectChannel([newUser.id, adminUser.id]).then(({channel}) => {
            // # Create token for the bot
            cy.apiAccessToken(newBot.user_id, 'some text').then(({token, id}) => {
                const msg1 = 'this is a bot message ' + botName;

                // # Create a post
                cy.postBotMessage({channelId: channel.id, message: msg1, token});

                // # Validate post presence
                cy.visit(`/${newTeam.name}/channels/` + channel.name);

                cy.getLastPostId().then((postId) => {
                    // * Validate post was created
                    cy.get(`#postMessageText_${postId}`, {timeout: TIMEOUTS.ONE_MIN}).should('contain', msg1);
                });

                // # Disable the bot token
                cy.visit(`/${newTeam.name}/integrations/bots`);

                cy.findByText(`Test Bot (@${botName})`).then((el) => {
                    // # Make sure it's on the screen
                    cy.wrap(el[0].parentElement.parentElement).scrollIntoView();

                    // # Delete token
                    cy.get(`[name="${id}_delete"]`).click();
                    cy.get('#confirmModalButton').click();

                    // # Try to post again
                    const msg2 = 'this is a bot message2 ' + botName;

                    // # Create a post
                    cy.postBotMessage({channelId: channel.id, message: msg2, token, failOnStatus: false}).then(({status}) => {
                        // * Validate that posting failed
                        expect(status, 403);
                    });
                });
            });
        });
    });
});
