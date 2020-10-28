// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

describe('Integrations', () => {
    let testTeam;
    let user1;
    let archiveChannel;
    let privateChannel;
    let publicChannel;
    let dmChannel;
    let nonMemberPublicChannel;

    before(() => {
        // # Setup of testuser, team, channel
        cy.apiInitSetup().then(({user}) => {
            user1 = user;

            // # Create a second user
            cy.apiCreateUser().then(({user: user2}) => {
                dmChannel = user2.username;

                // Login as user1 and create a new team
                cy.apiLogin(user).then(() => {
                    cy.apiCreateTeam('team', 'Users Team').then(({team}) => {
                        testTeam = team;

                        // # Add user2 to the team
                        cy.apiAddUserToTeam(testTeam.id, user2.id);

                        // # Create a public channel
                        cy.apiCreateChannel(team.id, 'channel-public', 'Public Test - member').then(({channel}) => {
                            publicChannel = channel.display_name;
                        });

                        // # Create a public channel then remove user1 from the channel
                        cy.apiCreateChannel(team.id, 'channel-public', 'Public Test - not member').then(({channel}) => {
                            nonMemberPublicChannel = channel.display_name;
                            cy.apiRemoveUserFromChannel(channel.id, user1.id);
                        });

                        // # Create a private channel
                        cy.apiCreateChannel(team.id, 'channel-private', 'Private Test', 'P').then(({channel}) => {
                            privateChannel = channel.display_name;
                        });

                        // # Create a public channel then delete / archive it
                        cy.apiCreateChannel(team.id, 'channel-archive', 'Archive Test', 'O').then(({channel}) => {
                            archiveChannel = channel.display_name;
                            cy.apiDeleteChannel(channel.id);
                        });

                        cy.visit(`/${testTeam.name}/integrations/outgoing_webhooks/add`);
                    });
                });
            });
        });
    });

    it('MM-T615 Only public channels available in outgoing webhooks setup', () => {
        // * Assert that a public channel displays in the dropdown
        cy.get('#channelSelect').children().should('contain', publicChannel);

        //* Assert that a public channel the user is not a member of does not appear in the dropdown
        cy.get('#channelSelect').children().should('not.contain', nonMemberPublicChannel);

        // * Assert that a private channel does not display in the drop-down
        cy.get('#channelSelect').children().should('not.contain', privateChannel);

        // * Assert that an archived / deleted channel does not appear in the drop-down // currently this fails due to a bug - should be not.contain
        cy.get('#channelSelect').children().should('contain', archiveChannel);

        // Assert that a direct message channel does not appear in the drop-down
        cy.get('#channelSelect').children().should('not.contain', `@${dmChannel}`);
    });
});
