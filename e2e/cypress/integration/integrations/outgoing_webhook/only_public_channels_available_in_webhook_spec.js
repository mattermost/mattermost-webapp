// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

describe('Messaging', () => {
    let testTeam;
    let testUser;
    let otherUser;
    let archiveChannel;
    let privateChannel;
    let publicChannel;
    let dmChannel;

    before(() => {
        // # Setup of testuser, team, channel
        cy.apiInitSetup().then(({team, user, channel}) => {
            testTeam = team;
            testUser = user;
            publicChannel = channel.display_name;
            cy.apiCreateUser().then(({user: newUser}) => {
                otherUser = newUser;
            });

            // # Create then archive (delete) a public channel
            cy.apiCreateChannel(team.id, 'channel-test', 'Archive Test', 'O').then(() => {
                archiveChannel = channel.display_name;
                cy.visit(`/${testTeam.name}/channels/${channel.name}`);
                cy.apiDeleteChannel(channel.id);
            });

            // # Create a private channel
            cy.apiCreateChannel(testTeam.id, 'channel-test', 'Private Test', 'P').then(() => {
                privateChannel = channel.display_name;
            });

            // # Create a direct message channel
            cy.apiLogin(testUser);
            cy.apiCreateDirectChannel([testUser.id, otherUser.id]).then(() => {
                dmChannel = channel.display_name;
            });
        });
    });

    it('MM-T134 Visual verification of tooltips on top nav, channel icons, posts', () => {
        cy.visit(`/${testTeam.name}/integrations/outgoing_webhooks/add`);
        cy.get('#channelSelect').children().should('not.contain', (privateChannel));
        cy.get('#channelSelect').children().should('not.contain', (archiveChannel)); // currently this fails due to a bug
        cy.get('#channelSelect').children().should('contain', publicChannel);
        cy.get('#channelSelect').children().should('not.contain', dmChannel);
    });
});
