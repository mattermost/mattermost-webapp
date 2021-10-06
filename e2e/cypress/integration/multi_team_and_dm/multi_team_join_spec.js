// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @multi_team_and_dm

const NUMBER_OF_TEAMS = 3;

describe('Multi-Team + DMs', () => {
    before(() => {
        cy.apiCreateUser().its('user').as('user');

        // delete all existing teams to clean-up
        cy.apiGetAllTeams({perPage: 1000}).then(({teams}) => {
            teams.forEach(({id}) => cy.apiDeleteTeam(id, true));
        });

        // create teams for user to join
        for (let i = 0; i < NUMBER_OF_TEAMS; i++) {
            cy.apiCreateTeam('team', 'Team', 'O', true, {allow_open_invite: true});
        }
    });

    it('MM-T1805 No infinite loading spinner on Select Team page', function() {
        cy.apiLogin(this.user);
        joinAllTeams();
        cy.get('.loading-screen').should('not.exist');
    });
});

function joinAllTeams() {
    cy.visit('/select_team');
    cy.findAllByRole('link', {name: /Join Team/}).then(([firstTeam, nextTeam]) => {
        firstTeam.click();

        if (nextTeam) {
            joinAllTeams();
        }
    });
}
