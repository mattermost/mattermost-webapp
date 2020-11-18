// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @bot_accounts

describe('Bot Tokens', () => {
    let townsquareChannel;

    before(() => {
        // # Set ServiceSettings to expected values
        const newSettings = {
            ServiceSettings: {
                EnableBotAccountCreation: true,
            },
        };
        cy.apiUpdateConfig(newSettings);

        cy.apiInitSetup().then(({team}) => {
            cy.apiGetChannelByName(team.name, 'town-square').then((out) => {
                townsquareChannel = out.channel;
            });
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T1880 Deleted token cannot be used to post', () => {
        const botName = 'bot-' + Date.now();
        const message = 'Hello, message from ' + botName;

        // # Create a bot and get bot user id
        cy.apiCreateBot(botName, 'Test Bot' + botName, 'test bot for E2E deleted token cannot be used to post').then(({bot}) => {
            const botUserId = bot.user_id;

            // # Get token from bot's id
            cy.apiAccessToken(botUserId, 'Create token').then(({token, id: tokenId}) => {
                //# Add bot to team
                cy.apiAddUserToTeam(townsquareChannel.team_id, botUserId);

                // # Post message as bot through api with auth token
                const props = {attachments: [{pretext: 'Some Pretext', text: 'Some Text'}]};
                cy.postBotMessage({token, message, props, channelId: townsquareChannel.id}).
                    its('id').
                    should('exist').
                    as('botPost');

                // # Go to the channel
                cy.get('#sidebarItem_town-square').click({force: true});

                // * Verify bot message
                cy.get('@botPost').then((postId) => {
                    cy.get(`#postMessageText_${postId}`).
                        should('be.visible').
                        and('have.text', message);
                });

                // # Revoke bot token
                cy.apiRevokeAccessToken(tokenId);

                // # Post message as bot through api with revoked auth token
                const baseUrl = Cypress.config('baseUrl');
                cy.task('postBotMessage', {token, message, props, channelId: townsquareChannel.id, baseUrl}).then(({status}) => {
                    // * Verify we get unauthorized response
                    expect(status).to.equal(401);
                });
            });
        });
    });
});
