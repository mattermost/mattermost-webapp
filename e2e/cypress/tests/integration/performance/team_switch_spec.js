// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel

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

    it('measures switching between two teams from LHS', () => {
        // # Invoke window object

        cy.window().
            its('performance').then((performance) => {
                // # Switch to Team 2
                cy.get('#teamSidebarWrapper').within(() => {
                    cy.get(`#${testTeam2.name}TeamButton`).click();
                }).

                // # Mark end of the load

                    then(() => performance.mark('teamLoad')).
                    then(() => {
                        performance.measure('teamLoad');
                        const measure = performance.getEntriesByName('teamLoad')[0];
                        const duration = measure.duration;

                        // * Verify the duration is less than the specified amount
                        assert.isAtMost(duration, 5000);

                        // # Log the performance
                        cy.log(
                            `[PERFORMANCE] Team switch: ${duration / 1000} seconds`,
                        );
                    });
            });
    });
});
