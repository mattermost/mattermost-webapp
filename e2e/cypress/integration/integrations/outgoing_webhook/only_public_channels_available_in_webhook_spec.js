// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Messaging', () => {
    let testTeam;
    let testChannel
    let channel;
    let archiveChannel
    let privateChannel

    before(() => {
        // # Login as test user and visit the newly created test channel
        cy.apiInitSetup().then(({team, user, channel}) => {
            testTeam = team;
            testChannel = channel
            testUser = user

            // # Login as regular user
            cy.apiLogin(user);

            // # Set up test channel with a long name
            //cy.apiCreateChannel(testTeam.id, 'channel-test', 'Archive Test').then(({channel}) => {
            //    const archivedChannel = channel.name
            //    cy.visit(`/${testTeam.name}/channels/${channel.name}`);

                //cy.uiArchiveChannel();
            });
            
        });
    

    it('MM-T134 Visual verification of tooltips on top nav, channel icons, posts', () => {


        cy.apiCreateChannel(testTeam.id, 'channel-test', 'Archive Test', 'O').then(({channel}) => {
            archiveChannel = channel;
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.uiArchiveChannel();
            //cy.visit(`/${testTeam.name}/integrations/outgoing_webhooks/add`);
            //cy.get('#channelSelect').contains(channel.display_name);
        });
        cy.apiCreateChannel(testTeam.id, 'channel-test', 'Private Test', 'P').then(({channel}) => {
            privateChannel = channel;
            //cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            //cy.uiArchiveChannel();
            //cy.visit(`/${testTeam.name}/integrations/outgoing_webhooks/add`);
            //cy.get('#channelSelect').should('not.contain', (channel.display_name);
        });
        cy.visit(`/${testTeam.name}/integrations/outgoing_webhooks/add`);
        cy.get('#channelSelect').should('not.contain', (channel.display_name);
        cy.get('#channelSelect').contains(channel.display_name);

        cy.apiLogin(testUser);

        
            




        //cy.visit(`/${testTeam.name}/integrations/outgoing_webhooks/add`);
        //cy.get('#channelSelect').contains(channel.name);
        //cy.get('#postListContent').find('.top').should('be.visible');
    });
});
