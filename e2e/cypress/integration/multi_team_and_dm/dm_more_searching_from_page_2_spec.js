// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @multi_team_and_dm

describe('Integrations', () => {
    let testChannel;
    let testTeam;
    let testUser;
    let multiUser;

    before(() => {
        // # Setup with the new team, channel and user
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;

            // # Create 50 users
            Cypress._.times(10, (i) =>{
                cy.apiCreateUser({prefix: `test + ${i}`}).then(() => {
                    cy.apiAddUserToTeam(testTeam.id, user.id)
                });
            });

            // # Login with testUser and visit test channel
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        });
    });

    it('MM-T446 DM More... searching from page 2 of user list', () => {
    });
});
