// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @menu

describe('LHS Menu action', () => {
    before(() => {
        cy.apiInitSetup().then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });

        cy.apiCreateTeam('team', 'Team');
    });

    it('MM-T1669 Team icon shows active state on click', () => {
        // # Assert if the team wrapper in LHS present
        cy.get('.team-wrapper').should('be.visible').within(() => {
            // # Assert if the teams bar present
            cy.get('[data-rbd-droppable-id="my_teams"]').should('have.length', 1).within(() => {
                // # Assert more than one teams are present
                cy.get('.team-container').should('have.length.gt', 1);

                // # Assert only one team is in active state
                cy.get('.active').should('have.length', 1);

                // # move the first team by clicking
                cy.get('.team-container').first().click();

                // # Assert the first team icon is in highlighted state
                cy.get('.team-container').first().should('have.class', 'active');

                // # move the last team by clicking
                cy.get('.team-container').last().click();

                // # Assert the last team icon is in highlighted state
                cy.get('.team-container').last().should('have.class', 'active');

                // # Assert the first team icon is not in highlighted state
                cy.get('.team-container').first().should('not.have.class', 'active');
            });
        });
    });
});