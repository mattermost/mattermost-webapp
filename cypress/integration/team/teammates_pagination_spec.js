// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 5] */

import users from '../../fixtures/users.json';

const sysadmin = users.sysadmin;

describe('Teams Suite', () => {
    // MaxUsersPerTeam setting must be >60.
    // Requires more than 60 available test users.
    // (e.g., make cypress-test-data)
    const recruitSize = 60;

    before(() => {
        // # New test case user
        cy.loginAsNewUser();

        // # Create a new team
        cy.apiCreateTeam('t', 'ts14868').its('body').as('team');

        // # Add recruitSize teammates
        cy.get('@team').then((team) => {
            const teamId = team.id;
            cy.getNonTeammates(sysadmin, teamId, false, recruitSize).then((profiles) => {
                const userIds = profiles.map((user) => user.id);
                cy.postAddTeammates(sysadmin, teamId, userIds);
            });
        });
    });

    it('TS14868 Team Admin can use Next button to page through list in Manage Members', () => {
        // # Get team name and visit that team
        cy.get('@team').then((team) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });

        // # Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // # Click Manage Members
        cy.get('#sidebarDropdownMenu #manageMembers').should('be.visible').click();

        // * Check Manage Members modal dialog
        cy.get('#teamMemberModalLabel').should('be.visible');

        // * Check teammate total
        cy.get('#searchableUserListTotal').should('contain', `1 - 50 members of ${recruitSize + 1} total`);

        // # Click Next button
        cy.get('#searchableUserListNextBtn').should('be.visible').click();

        // * Check teammate list advances by one page
        cy.get('#searchableUserListTotal').should('contain', `51 - 61 members of ${recruitSize + 1} total`);

        // # Click Prev button
        cy.get('#searchableUserListPrevBtn').should('be.visible').click();

        // * Check teammate list reverses by one page
        cy.get('#searchableUserListTotal').should('contain', `1 - 50 members of ${recruitSize + 1} total`);
    });
});
