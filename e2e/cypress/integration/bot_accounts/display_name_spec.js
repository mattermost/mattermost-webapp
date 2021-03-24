// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @bot_accounts

describe('Bot display name', () => {
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

    it('MM-T1813 Display name for bots stays current', () => {
        cy.makeClient().then((client) => {
            // # Create a bot and get bot user id
            cy.apiCreateBot().then(({bot}) => {
                const botUserId = bot.user_id;
                const firstMessage = 'This is the first message from a bot that will change its name';
                const secondMessage = 'This is the second message from a bot that has changed its name';

                // # Get token from bot's id
                cy.apiAccessToken(botUserId, 'Create token').then(({token}) => {
                    //# Add bot to team
                    cy.apiAddUserToTeam(townsquareChannel.team_id, botUserId);

                    // # Post message as bot through api with auth token
                    const props = {attachments: [{pretext: 'Some Pretext', text: 'Some Text'}]};
                    cy.postBotMessage({token, message: firstMessage, props, channelId: townsquareChannel.id}).
                        its('id').
                        should('exist').
                        as('botPost');

                    // # Go to the channel
                    cy.get('#sidebarItem_town-square').click({force: true});

                    // * Verify bot displayname
                    cy.get('@botPost').then((postIdA) => {
                        cy.get(`#post_${postIdA} button.user-popover`).click();

                        cy.get('#user-profile-popover').
                            should('be.visible');

                        cy.findByTestId(`popover-fullname-${bot.username}`).
                            should('have.text', bot.display_name);
                    }).then(() => {
                        // # Change displayname after prior verification
                        cy.wrap(client.patchBot(bot.user_id, {display_name: `NEW ${bot.display_name}`})).then((newBot) => {
                            cy.postBotMessage({token, message: secondMessage, props, channelId: townsquareChannel.id}).
                                its('id').
                                should('exist').
                                as('newBotPost');

                            // * Verify changed displayname
                            cy.get('@newBotPost').then(() => {
                                cy.get('#user-profile-popover').
                                    should('be.visible');

                                cy.findByTestId(`popover-fullname-${bot.username}`).
                                    should('have.text', newBot.display_name);
                            });
                        });
                    });
                });
            });
        });
    });
});
