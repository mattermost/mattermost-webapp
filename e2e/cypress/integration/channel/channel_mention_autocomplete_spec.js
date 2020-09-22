// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Channel', () => {
    let testTeam;
    let ownChannel;
    let otherChannel;
    let testUser;

    before(() => {
        // # Login as new user and visit town-square
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            ownChannel = channel;
            testUser = user;

            cy.apiCreateChannel(testTeam.id, 'delta-test', 'Delta Channel').then((out) => {
                otherChannel = out.channel;
            });

            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('Channel autocomplete should have both lists populated correctly', () => {
        // # Type "~"
        cy.get('#post_textbox').should('be.visible').clear().type('~').wait(TIMEOUTS.HALF_SEC);
        cy.get('#loadingSpinner').should('not.exist');

        // * Should open up suggestion list for channels
        // * Should match each channel item and group label
        cy.get('#suggestionList').should('be.visible').children().within((el) => {
            cy.wrap(el).eq(0).should('contain', 'My Channels');
            cy.wrap(el).eq(1).should('contain', ownChannel.display_name);
            cy.wrap(el).eq(2).should('contain', 'Off-Topic');
            cy.wrap(el).eq(3).should('contain', 'Town Square');
            cy.wrap(el).eq(4).should('contain', 'Other Channels');
            cy.wrap(el).eq(5).should('contain', otherChannel.display_name);
        });
    });

    it('Joining a channel should alter channel mention autocomplete lists accordingly', () => {
        // # Join a channel by /join slash command
        cy.get('#post_textbox').should('be.visible').clear().wait(TIMEOUTS.HALF_SEC).type(`/join ~${otherChannel.name}`).type('{enter}').wait(TIMEOUTS.HALF_SEC);

        // * Verify that it redirects into the channel
        cy.url().should('include', `/${testTeam.name}/channels/${otherChannel.name}`);

        // # Type "~"
        cy.get('#post_textbox').should('be.visible').type('~').wait(TIMEOUTS.HALF_SEC);
        cy.get('#loadingSpinner').should('not.exist');

        // * Should open up suggestion list for channels
        // * Should match each channel item and group label
        cy.get('#suggestionList').should('be.visible').children().within((el) => {
            cy.wrap(el).eq(0).should('contain', 'My Channels');
            cy.wrap(el).eq(1).should('contain', ownChannel.display_name);
            cy.wrap(el).eq(2).should('contain', otherChannel.display_name);
            cy.wrap(el).eq(3).should('contain', 'Off-Topic');
            cy.wrap(el).eq(4).should('contain', 'Town Square');
        });
    });

    it('Getting removed from a channel should alter channel mention autocomplete lists accordingly', () => {
        // # Remove test user from the test channel
        cy.apiAdminLogin();
        cy.removeUserFromChannel(otherChannel.id, testUser.id).then((res) => {
            expect(res.status).to.equal(200);

            // # Login as test user and visit the test team
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/town-square`);

            // # Type "~"
            cy.get('#post_textbox').should('be.visible').clear().type('~').wait(TIMEOUTS.HALF_SEC);
            cy.get('#loadingSpinner').should('not.exist');

            // * Should open up suggestion list for channels
            // * Should match each channel item and group label
            cy.get('#suggestionList').should('be.visible').children().within((el) => {
                cy.wrap(el).eq(0).should('contain', 'My Channels');
                cy.wrap(el).eq(1).should('contain', ownChannel.display_name);
                cy.wrap(el).eq(2).should('contain', 'Off-Topic');
                cy.wrap(el).eq(3).should('contain', 'Town Square');
                cy.wrap(el).eq(4).should('contain', 'Other Channels');
                cy.wrap(el).eq(5).should('contain', otherChannel.display_name);
            });
        });
    });
});
