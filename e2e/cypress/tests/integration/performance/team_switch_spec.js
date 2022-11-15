// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel
import {measurePerformance} from './utils.js';

describe('Channel switch performance test', () => {
    let testUser;
    let testTeam2;
    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;

            // # Login as test user and go to town square
            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });

        cy.apiCreateTeam('team-b', 'Team B').then(({team}) => {
            testTeam2 = team;
        });
    });

    it('measures switching between two teams from LHS', async () => {
        // # Invoke window object

        await measurePerformance('teamLoad', 500, () => {
            // # Switch to Team 2
            cy.get('#teamSidebarWrapper').within(() => {
                cy.get(`#${testTeam2.name}TeamButton`).click();
            });

            // * Expect that the user has switched teams
            expectActiveTeamToBe(testTeam2.display_name, testTeam2.name);
        });
    });
});

const expectActiveTeamToBe = (title, url) => {
    // * Expect channel title to match title passed in argument
    cy.get('#sidebar-header-container').
        should('be.visible').
        and('contain.text', title);

    // * Expect url to match url passed in argument
    cy.url().should('contain', url);
};
