// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Teams Suite', () => {
    it('TS14868 Team Admin can use Next button to page through list in Manage Members', () => {
        cy.apiLogin('user-1');

        // # Create new team and visit its URL
        cy.apiCreateTeam('test-team', 'Test Team').then((createResponse) => {
            const testTeam = createResponse.body;
            cy.visit(`/${testTeam.name}`);

            cy.apiGetUsersNotInTeam(testTeam.id).then((getResponse) => {
                const users = getResponse.body;

                const usersToAdd = users.slice(0, 59).map((user) => {
                    return {
                        team_id: testTeam.id,
                        user_id: user.id,
                    };
                });

                Cypress._.chunk(usersToAdd, 20).forEach((chunk) => {
                    cy.apiAddUsersToTeam(testTeam.id, chunk);
                });
            });
        });

        // # Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // # Click Manage Members
        cy.get('#sidebarDropdownMenu #manageMembers').should('be.visible').click();

        // * Check Manage Members modal dialog
        cy.get('#teamMemberModalLabel').should('be.visible');

        // * Check teammate total
        cy.get('#searchableUserListTotal').should('contain', '1 - 50 members of 60 total');

        // # Click Next button
        cy.get('#searchableUserListNextBtn').should('be.visible').click();

        // * Check teammate list advances by one page
        cy.get('#searchableUserListTotal').should('contain', '51 - 60 members of 60 total');

        // # Click Prev button
        cy.get('#searchableUserListPrevBtn').should('be.visible').click();

        // * Check teammate list reverses by one page
        cy.get('#searchableUserListTotal').should('contain', '1 - 50 members of 60 total');
    });
});
