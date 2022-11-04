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

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;

            // # Login as test user and go to town square
            cy.apiLogin(testUser);
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('measures switching between two channels from LHS', () => {
        // # Invoke window object

        cy.window().
            its('performance').then((performance) => {
                // # Switch channel to Off-topic

                cy.get('#sidebarItem_off-topic').click({force: true}).

                // # Mark end of the load

                    then(() => performance.mark('channelLoad')).
                    then(() => {
                        performance.measure('channelLoad');
                        const measure = performance.getEntriesByName('channelLoad')[0];
                        const duration = measure.duration;

                        // * Verify the duration is less than the specified amount
                        assert.isAtMost(duration, 5000);

                        // # Log the performance
                        cy.log(
                            `[PERFORMANCE] Channel switch: ${duration / 1000} seconds`,
                        );
                    });
            });
    });
});
