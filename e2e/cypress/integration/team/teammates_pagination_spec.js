// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Teams Suite', () => {
    before(() => {
        cy.apiLogin('user-1');

        // # Create new team and visit its URL
        cy.apiCreateTeam('test-team', 'Test Team').then((createResponse) => {
            const testTeam = createResponse.body;
            cy.visit(`/${testTeam.name}`);

            const users = [];

            cy.apiGetUsersNotInTeam(testTeam.id, 0, 200).then((pageOne) => {
                pageOne.body.forEach((user) => users.push(user));

                cy.apiGetUsersNotInTeam(testTeam.id, 1, 200).then((pageTwo) => {
                    pageTwo.body.forEach((user) => users.push(user));

                    const activeUsers = users.filter((user) => user.delete_at === 0);
                    const usersToAdd = activeUsers.slice(0, 59).map((user) => {
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
        });
    });

    it('TS14868 Team Admin can use Next button to page through list in Manage Members', () => {
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
