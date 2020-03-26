// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';
import * as TIMEOUTS from '../../fixtures/timeouts';

function joinChannel(testTeam, testChannel) {
    // # Join a channel by /join slash command
    cy.get('#post_textbox').should('be.visible').clear().wait(TIMEOUTS.TINY).type(`/join ~${testChannel.name}`).type('{enter}').wait(TIMEOUTS.TINY);

    // * Verify that it redirects into the channel
    cy.url().should('include', `/${testTeam.name}/channels/${testChannel.name}`);
}

describe('Channel', () => {
    let testTeam;
    let testChannel;

    beforeEach(() => {
        // # Login as user-1
        cy.apiLogin('user-1');

        // # Create new team and add user to team
        cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
            testTeam = response.body;

            cy.apiGetUserByEmail(users.sysadmin.email).then((eRes) => {
                const user = eRes.body;
                cy.apiAddUserToTeam(testTeam.id, user.id);

                cy.apiLogin('sysadmin');
                cy.apiCreateChannel(testTeam.id, 'test-channel', 'Test Channel').then((cRes) => {
                    testChannel = cRes.body;

                    cy.apiLogin('user-1');
                    cy.visit(`/${testTeam.name}/channels/town-square`);
                });
            });
        });
    });

    it('Channel autocomplete should have both lists populated correctly', () => {
        // # Type "~"
        cy.get('#post_textbox').should('be.visible').clear().type('~');
        cy.get('#loadingSpinner', {timeout: TIMEOUTS.SMALL}).should('not.exist');

        // * Should open up suggestion list for channels
        // * Should match each channel item and group label
        cy.get('#suggestionList', {timeout: TIMEOUTS.SMALL}).should('be.visible').children().within((el) => {
            cy.wrap(el).eq(0).should('contain', 'My Channels');
            cy.wrap(el).eq(1).should('contain', 'Off-Topic');
            cy.wrap(el).eq(2).should('contain', 'Town Square');
            cy.wrap(el).eq(3).should('contain', 'Other Channels');
            cy.wrap(el).eq(4).should('contain', testChannel.display_name);
        });
    });

    it('Joining a channel should alter channel mention autocomplete lists accordingly', () => {
        // # Join a channel
        joinChannel(testTeam, testChannel);

        // # Type "~"
        cy.get('#post_textbox').should('be.visible').type('~');
        cy.get('#loadingSpinner', {timeout: TIMEOUTS.SMALL}).should('not.exist');

        // * Should open up suggestion list for channels
        // * Should match each channel item and group label
        cy.get('#suggestionList', {timeout: TIMEOUTS.SMALL}).should('be.visible').children().within((el) => {
            cy.wrap(el).eq(0).should('contain', 'My Channels');
            cy.wrap(el).eq(1).should('contain', 'Off-Topic');
            cy.wrap(el).eq(2).should('contain', testChannel.display_name);
            cy.wrap(el).eq(3).should('contain', 'Town Square');
        });
    });

    it('Getting removed from a channel should alter channel mention autocomplete lists accordingly', () => {
        // # Join a channel
        joinChannel(testTeam, testChannel);

        // # Remove user-1 from the test channel
        cy.apiGetMe().then((res) => {
            const userId = res.body.id;
            return cy.removeUserFromChannel(testChannel.id, userId);
        }).then((res) => {
            expect(res).to.equal(200);

            // # Login as user-1 and visit the test team
            cy.apiLogin('user-1');
            cy.visit(`/${testTeam.name}/channels/town-square`);

            // # Type "~"
            cy.get('#post_textbox').should('be.visible').clear().type('~');
            cy.get('#loadingSpinner', {timeout: TIMEOUTS.SMALL}).should('not.exist');

            // * Should open up suggestion list for channels
            // * Should match each channel item and group label
            cy.get('#suggestionList', {timeout: TIMEOUTS.SMALL}).should('be.visible').children().within((el) => {
                cy.wrap(el).eq(0).should('contain', 'My Channels');
                cy.wrap(el).eq(1).should('contain', 'Off-Topic');
                cy.wrap(el).eq(2).should('contain', 'Town Square');
                cy.wrap(el).eq(3).should('contain', 'Other Channels');
                cy.wrap(el).eq(4).should('contain', testChannel.display_name);
            });
        });
    });
});
