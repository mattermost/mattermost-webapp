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
    let testUser;
    let user2;
    let archiveChannel;
    let privateChannel;
    let publicChannel;
    let dmChannel;
    let nonMemberPublicChannel;

    before(() => {
        // # Setup of testuser, team, channel
        cy.apiInitSetup().then(({team, user, channel}) => {
            testTeam = team;
            testUser = user;
            publicChannel = channel.display_name;
            
            // # Create a second user
            // Saturn advised to have the user create a new team and that will enable
            // the integrations page for the non sysadmin user
            cy.apiCreateUser().then(({user: user2}) => {
                dmChannel = user2.username 
                console.log(user2.username)
            })
            //dmChannel = `@${user.username}`
            //    console.log(dmChannel)

            // # Create a public channel, add a user, then archive the channel
            cy.apiCreateChannel(testTeam.id, 'channel-test', 'Archive Test', 'O').then(({channel}) => {
                cy.apiAddUserToChannel(channel.id, user2.id);
                archiveChannel = channel.display_name;
                console.log(archiveChannel)
                cy.apiDeleteChannel(channel.id);
            });

            // # Create a private channel and add user to the channel
            cy.apiCreateChannel(testTeam.id, 'channel-test', 'Private Test', 'P').then(({channel}) => {
                cy.apiAddUserToChannel(channel.id, user2.id);
                privateChannel = channel.display_name;
             });

            // # Create a public channel that the user does not belong to
            cy.apiCreateChannel(testTeam.id, 'channel-test', 'Not Member Test', 'O').then(({channel}) => {
                nonMemberPublicChannel = channel.display_name;
                console.log(nonMemberPublicChannel)
            });

             // # Visit the Add Outgoing Webhooks page
             cy.apiLogin(user2)
             cy.visit(`/${testTeam.name}/integrations/outgoing_webhooks/add`);
        });
    });

    it('MM-T615 Only public channels available in outgoing webhooks setup', () => {
        
        cy.get('#channelSelect').children().should('not.contain', privateChannel);
        cy.get('#channelSelect').children().should('contain', archiveChannel); // currently this fails due to a bug
        cy.get('#channelSelect').children().should('contain', publicChannel);
        cy.get('#channelSelect').children().should('not.contain', dmChannel);
    });
});
