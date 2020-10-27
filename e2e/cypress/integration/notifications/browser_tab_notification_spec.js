// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @notifications

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Notifications', () => {
    let user1;
    let user2;
    let team2;
    let testTeam1TownSquareUrl;
    let testTeam2TownSquareUrl;

    const timestamp = Date.now();

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            user1 = user;
            testTeam1TownSquareUrl = `/${team.name}/channels/town-square`;

            cy.apiCreateUser().then(({user: otherUser}) => {
                user2 = otherUser;
                cy.apiAddUserToTeam(team.id, user2.id);
            });

            cy.apiCreateTeam(`test-team-${timestamp}`, `test-team-${timestamp}`).then(({team: anotherTeam}) => {
                team2 = anotherTeam;
                testTeam2TownSquareUrl = `/${team2.name}/channels/town-square`;
                cy.apiAddUserToTeam(team2.id, user1.id);
                cy.apiAddUserToTeam(team2.id, user2.id);
            });
        });
    });

    it('MM-T560_1 Browser tab and team sidebar unreads and mentions - Mention in different team', () => {
        let originalFavicon = '';

        // # User 1 view team A
        cy.apiLogin(user1);
        cy.visit(testTeam1TownSquareUrl);
        cy.wait(TIMEOUTS.FIVE_SEC);

        // # Remove all unreads before test
        cy.get('#publicChannelList').should('be.visible').get('li').eq(1).click();

        // * Check for no unreads or mentions
        cy.get('.unread-title').should('not.exist');

        // # Save path of current favicon path
        cy.get('link[rel=icon]').should('have.attr', 'href').then(($path) => {
            originalFavicon = $path;
        });

        // # Have another user view team B
        cy.apiLogin(user2);
        cy.visit(testTeam2TownSquareUrl);
        cy.wait(TIMEOUTS.FIVE_SEC);

        // # Post a message with mentioning User 1 from Town Square
        cy.postMessage(`@${user1.username}`);

        // # Return to User 1
        cy.visit(testTeam1TownSquareUrl);
        cy.apiLogin(user1);

        // * Browser tab should displays (1) * channel - [team name] Mattermost
        cy.title().should('include', '(1)');

        // * Team sidebar: Small dot left of team B icon in team sidebar
        cy.get(`#${team2.name}TeamButton`).parent('.unread').should('be.visible').
            within(() => {
                // * Team sidebar: a mention badge in top right corner of the badge with number "1"
                cy.get('.badge').contains('1').

                // # Make mention indicated
                    click();
            });

        // * Favicon should stay blue (not turn red) when there are mentions indicated
        cy.get('link[rel=icon]').should('have.attr', 'href').then(($path) => {
            expect($path).to.eq(originalFavicon);
        });
    });

    it('MM-T560_2 Team sidebar icon - Badge with mention count increments when added to channel', () => {
        // # User 1 view and remain on team A
        cy.apiLogin(user1);
        cy.visit(testTeam1TownSquareUrl);

        // # Have another user view team B
        cy.apiLogin(user2);
        cy.visit(testTeam2TownSquareUrl);
        cy.wait(TIMEOUTS.HALF_SEC);

        // # Create a new channel
        cy.get('#createPublicChannel').should('be.visible').click();
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.get('#newChannelName').should('be.visible').type('new-channel');
        cy.get('#submitNewChannel').click();
        cy.wait(TIMEOUTS.HALF_SEC);

        // # Invites User 1
        cy.get('#member_popover').should('be.visible').click();
        cy.contains('Manage Members').click();
        cy.contains('Add Members').click();
        cy.contains(`${user1.username}`).click();
        cy.get('#saveItems').click();
        cy.wait(TIMEOUTS.HALF_SEC);

        // * User 1 should be added.
        cy.getLastPost().
            should('contain', `@${user1.username}`).
            should('contain', 'added to the channel');

        cy.wait(TIMEOUTS.HALF_SEC);

        // # Change User 2's view to Team 1
        cy.visit(testTeam1TownSquareUrl);

        // # Switch to User 1
        cy.apiLogin(user1);

        // Because user changed by api, refresh is needed
        cy.visit(testTeam1TownSquareUrl);
        cy.wait(TIMEOUTS.HALF_SEC);

        // * Title should be increased
        cy.title().should('include', '(1)');

        // * Team sidebar: Small dot left of team B icon in team sidebar
        cy.get(`#${team2.name}TeamButton`).should('be.visible').
            within(() => {
            // * Team sidebar: a mention badge in top right corner of the badge with number "1"
                cy.get('.badge').contains('1');
            });
    });
});
