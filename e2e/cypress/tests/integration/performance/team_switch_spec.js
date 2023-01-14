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
    let testTeam1;
    let testTeam2;

    beforeEach(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam1 = team;

            // # Login as test user and go to town square
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam1.name}/channels/town-square`);
        });

        cy.apiCreateTeam('team-b', 'Team B').then(({team}) => {
            testTeam2 = team;
        });
    });

    it('measures switching between two teams from LHS', () => {
        // # Invoke window object
        measurePerformance('teamLoad', 900, () => {
            // # Switch to Team 2
            cy.get('#teamSidebarWrapper').within(() => {
                cy.get(`#${testTeam2.name}TeamButton`).should('be.visible').click();
            });

            // * Expect that the user has switched teams
            return expectActiveTeamToBe(testTeam2.display_name, testTeam2.name);
        },

        // # Reset test run so we can start on the initially specified team
        () => {
            cy.visit(`/${testTeam1.name}/channels/town-square`);
        },
        );
    });
});

const expectActiveTeamToBe = (title, url) => {
    // * Expect channel title to match title passed in argument
    cy.get('#sidebar-header-container').
        should('be.visible').
        and('contain.text', title);

    // * Expect that center channel is visible and page has loaded
    cy.get('#app-content').should('be.visible');

    // * Expect url to match url passed in argument
    return cy.url().should('contain', url);
};
