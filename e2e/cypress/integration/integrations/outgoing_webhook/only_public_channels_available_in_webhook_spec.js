// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @integrations

import * as TIMEOUTS from '../../../fixtures/timeouts';


describe('Messaging', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let channel;
    let archiveChannel;
    let privateChannel;

    before(() => {
        // # Login as test user and visit the newly created test channel
        cy.apiInitSetup().then(({team, user, channel}) => {
            testTeam = team;
            testChannel = channel
            testUser = user
            });
        });

    it('MM-T134 Visual verification of tooltips on top nav, channel icons, posts', () => {
        cy.apiCreateChannel(testTeam.id, 'channel-test', 'Archive Test', 'O').then(({channel}) => {
            archiveChannel = channel;
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.uiArchiveChannel();
            cy.visit(`/${testTeam.name}/integrations/outgoing_webhooks/add`);
            cy.get('#channelSelect').children().should('not.contain', (channel.display_name));
        });
        //cy.apiCreateChannel(testTeam.id, 'channel-test', 'Private Test', 'P').then(({channel}) => {
        //    privateChannel = channel;
        //    cy.visit(`/${testTeam.name}/integrations/outgoing_webhooks/add`);
        //    cy.get('#channelSelect').should('not.contain', (channel.display_name));
    });
});
