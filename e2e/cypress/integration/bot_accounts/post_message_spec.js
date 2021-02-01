// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @bot_accounts

describe('Bot post message', () => {
    let townsquareChannel;

    before(() => {
        // # Set ServiceSettings to expected values
        const newSettings = {
            ServiceSettings: {
                EnableBotAccountCreation: true,
                EnableUserAccessTokens: false,
            },
        };
        cy.apiUpdateConfig(newSettings);

        cy.apiInitSetup().then(({team}) => {
            cy.apiGetChannelByName(team.name, 'town-square').then(({channel}) => {
                townsquareChannel = channel;
            });
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T1812 Post as a bot when personal access tokens are false', () => {
        // # Create a bot and get bot user id
        cy.apiCreateBot().then(({bot}) => {
            const botUserId = bot.user_id;
            const message = 'This is a message from a bot.';

            // # Get token from bot's id
            cy.apiAccessToken(botUserId, 'Create token').then(({token}) => {
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
            });
        });
    });
});
