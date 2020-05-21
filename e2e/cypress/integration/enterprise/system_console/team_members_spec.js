// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../../fixtures/users.json';
import * as TIMEOUTS from '../../../fixtures/timeouts';

let team;
let user1;
let user2;
let sysadmin;

const saveConfig = () => {
    // # Click save
    cy.get('#saveSetting').click();

    // # Check that the members block is no longer visible meaning that the save has succeeded and we were redirected out
    cy.get('#teamMembers').should('not.be.visible');
};

describe('Team members test', () => {
    before(() => {
        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // * Check if server has license
        cy.requireLicense();

        // # Reset data before running tests
        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // # Create a new team that is not group constrained
        cy.apiCreateTeam('test-team', 'Test Team').then((teamRes) => {
            team = teamRes.body;

            // # Make sure user1 is in the team initially
            cy.apiGetUserByEmail(users['user-1'].email).then((user1Res) => {
                user1 = user1Res.body;
                cy.apiAddUserToTeam(team.id, user1.id);
            });

            // # Make sure user2 is in the team initially
            cy.apiGetUserByEmail(users['user-2'].email).then((user2Res) => {
                user2 = user2Res.body;
                cy.apiAddUserToTeam(team.id, user2.id);
            });

            // # Make sure sysadmin is in the team initially
            cy.apiGetUserByEmail(users.sysadmin.email).then((sysadminRes) => {
                sysadmin = sysadminRes.body;
                cy.apiAddUserToTeam(team.id, sysadmin.id);
            });
        });
    });

    after(() => {
        // # Reset data after running tests
        cy.apiLogin('sysadmin');

        if (team?.id) {
            cy.apiDeleteTeam(team.id, true);
        }
    });

    it('MM-23938 - Team members block is only visible when team is not group synced', () => {
        // # Visit the team page
        cy.visit(`/admin_console/user_management/teams/${team.id}`);

        // * Assert that the members block is visible on non group synced team
        cy.get('#teamMembers').scrollIntoView().should('be.visible');

        // # Click the sync group members switch
        cy.findByTestId('syncGroupSwitch').scrollIntoView().click();

        // * Assert that the members block is no longer visible
        cy.get('#teamMembers').should('not.be.visible');
    });

    it('MM-23938 - Team members block can search for users, remove users, add users and modify their roles', () => {
        // # Visit the team page
        cy.visit(`/admin_console/user_management/teams/${team.id}`);

        // * Assert that the members block is visible on non group synced team
        cy.get('#teamMembers').scrollIntoView().should('be.visible');

        // # Search for user1 that we know is in the team
        cy.get('#teamMembers .DataGrid_search input').clear().type(user1.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // # Wait till loading complete and then remove the only visible user
        cy.get('#teamMembers .DataGrid_loading').should('not.be.visible');
        cy.get('#teamMembers .UserGrid_removeRow a').should('be.visible').click();

        // # Attempt to save
        cy.get('#saveSetting').click();

        // * Assert that confirmation modal contains the right message
        cy.get('#confirmModalBody').should('be.visible').and('contain', '1 user will be removed.').and('contain', 'Are you sure you wish to remove this user?');

        // # Cancel
        cy.get('#cancelModalButton').click();

        // # Search for user2 that we know is in the team
        cy.get('#teamMembers .DataGrid_search input').clear().type(user2.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // # Wait till loading complete and then remove the only visible user
        cy.get('#teamMembers .DataGrid_loading').should('not.be.visible');
        cy.get('#teamMembers .UserGrid_removeRow a').should('be.visible').click();

        // # Attempt to save
        cy.get('#saveSetting').click();

        // * Assert that confirmation modal contains the right message
        cy.get('#confirmModalBody').should('be.visible').and('contain', '2 users will be removed.').and('contain', 'Are you sure you wish to remove these users?');

        // # Confirm Save
        cy.get('#confirmModalButton').click();

        // # Check that the members block is no longer visible meaning that the save has succeeded and we were redirected out
        cy.get('#teamMembers').should('not.be.visible');

        // # Visit the team page
        cy.visit(`/admin_console/user_management/teams/${team.id}`);

        // # Search for user1 that we know is no longer in the team
        cy.get('#teamMembers .DataGrid_search input').scrollIntoView().clear().type(user1.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // * Assert that no matching users found
        cy.get('#teamMembers .DataGrid_rows').should('contain', 'No users found');

        // # Search for user2 that we know is no longer in the team
        cy.get('#teamMembers .DataGrid_search input').clear().type(user2.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // * Assert that no matching users found
        cy.get('#teamMembers .DataGrid_rows').should('contain', 'No users found');

        // # Open the add members modal
        cy.findByTestId('addTeamMembers').click();

        // # Enter user1 and user2 emails
        cy.get('#addUsersToTeamModal input').clear().type(`${user1.email}{enter}${user2.email}{enter}`);

        // # Confirm add the users
        cy.get('#addUsersToTeamModal #saveItems').click();

        // # Search for user1
        cy.get('#teamMembers .DataGrid_search input').clear().type(user1.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // * Assert that the user is now added to the members block and contains text denoting that they are New
        cy.get('#teamMembers .DataGrid_rows').children(0).should('contain', user1.email).and('contain', 'New');

        // # Open the user role dropdown menu
        cy.get(`#userGridRoleDropdown_${user1.username}`).click();

        // * Verify that the menu is opened
        cy.get('.Menu__content').should('be.visible').within(() => {
            // # Make the user an admin
            cy.findByText('Make Team Admin').should('be.visible').click();
        });

        // # Search for user2
        cy.get('#teamMembers .DataGrid_search input').clear().type(user2.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // * Assert that the user is now added to the members block and contains text denoting that they are New
        cy.get('#teamMembers .DataGrid_rows').children(0).should('contain', user2.email).and('contain', 'New');

        // # Search for sysadmin
        cy.get('#teamMembers .DataGrid_search input').clear().type(sysadmin.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // * Assert that searching for users after adding users returns only relevant search results
        cy.get('#teamMembers .DataGrid_rows').children(0).should('contain', sysadmin.email);

        // # Attempt to save
        saveConfig();

        // # Visit the team page
        cy.visit(`/admin_console/user_management/teams/${team.id}`);

        // # Search user1 that we know is now in the team again
        cy.get('#teamMembers .DataGrid_search input').scrollIntoView().clear().type(user1.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes
        cy.get('#teamMembers .DataGrid_loading').should('not.be.visible');

        // * Assert that the user is now saved as an admin
        cy.get('#teamMembers .DataGrid_rows').children(0).should('contain', user1.email).and('not.contain', 'New').and('contain', 'Team Admin');

        // # Open the user role dropdown menu
        cy.get(`#userGridRoleDropdown_${user1.username}`).click();

        // * Verify that the menu is opened
        cy.get('.Menu__content').should('be.visible').within(() => {
            // # Make the user a regular member again
            cy.findByText('Make Team Member').should('be.visible').click();
        });

        // * Assert user1 is now back to being a regular member
        cy.get('#teamMembers .DataGrid_rows').children(0).should('contain', user1.email).and('not.contain', 'New').and('contain', 'Team Member');

        // # Search user2 that we know is now in the team again
        cy.get('#teamMembers .DataGrid_search input').scrollIntoView().clear().type(user2.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes
        cy.get('#teamMembers .DataGrid_loading').should('not.be.visible');

        // * Assert user2 is now saved as a regular member
        cy.get('#teamMembers .DataGrid_rows').children(0).should('contain', user2.email).and('not.contain', 'New').and('contain', 'Team Member');

        // # Attempt to save
        saveConfig();
    });
});
