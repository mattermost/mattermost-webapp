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
let channel;
let user1;
let user2;
let sysadmin;

const saveConfig = () => {
    // # Click save
    cy.get('#saveSetting').click();

    // # Check that the members block is no longer visible meaning that the save has succeeded and we were redirected out
    cy.get('#channelMembers').should('not.be.visible');
};

describe('Channel members test', () => {
    before(() => {
        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // * Check if server has license
        cy.requireLicense();

        // # Create a new team and channel that are not group constrained
        cy.apiCreateTeam('test-team', 'Test Team').then((teamRes) => {
            team = teamRes.body;
            cy.apiCreateChannel(team.id, 'channel-members-test-channel', 'Channel members test channel').then((channelRes) => {
                channel = channelRes.body;

                // # Make sure user1 is in the team and channel initially
                cy.apiGetUserByEmail(users['user-1'].email).then((user1Res) => {
                    user1 = user1Res.body;
                    cy.apiAddUserToTeam(team.id, user1.id).then(() => {
                        cy.apiAddUserToChannel(channel.id, user1.id);
                    });
                });

                // # Make sure user2 is in the team and channel initially
                cy.apiGetUserByEmail(users['user-2'].email).then((user2Res) => {
                    user2 = user2Res.body;
                    cy.apiAddUserToTeam(team.id, user2.id).then(() => {
                        cy.apiAddUserToChannel(channel.id, user2.id);
                    });
                });

                // # Make sure sysadmin is in the team and channel initially
                cy.apiGetUserByEmail(users.sysadmin.email).then((sysadminRes) => {
                    sysadmin = sysadminRes.body;
                    cy.apiAddUserToTeam(team.id, sysadmin.id).then(() => {
                        cy.apiAddUserToChannel(channel.id, sysadmin.id);
                    });
                });
            });
        });
    });

    after(() => {
        // # Login as sysadmin
        cy.apiLogin('sysadmin');

        // # Reset data after running tests
        if (channel?.id) {
            cy.apiDeleteChannel(channel.id).then(() => {
                if (team?.id) {
                    cy.apiDeleteTeam(team.id, true);
                }
            });
        }
    });

    it('MM-23938 - Channel members block is only visible when channel is not group synced', () => {
        // # Visit the channel page
        cy.visit(`/admin_console/user_management/channels/${channel.id}`);

        // * Assert that the members block is visible on non group synced channel
        cy.get('#channelMembers').scrollIntoView().should('be.visible');

        // # Click the sync group members switch
        cy.findByTestId('syncGroupSwitch').scrollIntoView().click();

        // * Assert that the members block is no longer visible
        cy.get('#channelMembers').should('not.be.visible');
    });

    it('MM-23938 - Channel Members block can search for users, remove users, add users and modify their roles', () => {
        // # Visit the channel page
        cy.visit(`/admin_console/user_management/channels/${channel.id}`);

        // * Assert that the members block is visible on non group synced team
        cy.get('#channelMembers').scrollIntoView().should('be.visible');

        // # Search for user1 that we know is in the team
        cy.get('#channelMembers .DataGrid_search input').clear().type(user1.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // # Wait till loading complete and then remove the only visible user
        cy.get('#channelMembers .DataGrid_loading').should('not.be.visible');
        cy.get('#channelMembers .UserGrid_removeRow a').should('be.visible').click();

        // # Attempt to save
        cy.get('#saveSetting').click();

        // * Assert that confirmation modal contains the right message
        cy.get('#confirmModalBody').should('be.visible').and('contain', '1 user will be removed.').and('contain', 'Are you sure you wish to remove this user?');

        // # Cancel
        cy.get('#cancelModalButton').click();

        // # Search for user2 that we know is in the team
        cy.get('#channelMembers .DataGrid_search input').clear().type(user2.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // # Wait till loading complete and then remove the only visible user
        cy.get('#channelMembers .DataGrid_loading').should('not.be.visible');
        cy.get('#channelMembers .UserGrid_removeRow a').should('be.visible').click();

        // # Attempt to save
        cy.get('#saveSetting').click();

        // * Assert that confirmation modal contains the right message
        cy.get('#confirmModalBody').should('be.visible').and('contain', '2 users will be removed.').and('contain', 'Are you sure you wish to remove these users?');

        // # Confirm Save
        cy.get('#confirmModalButton').click();

        // # Check that the members block is no longer visible meaning that the save has succeeded and we were redirected out
        cy.get('#channelMembers').should('not.be.visible');

        // # Visit the channel page
        cy.visit(`/admin_console/user_management/channels/${channel.id}`);

        // # Search for user1 that we know is no longer in the team
        cy.get('#channelMembers .DataGrid_search input').scrollIntoView().clear().type(user1.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // * Assert that no matching users found
        cy.get('#channelMembers .DataGrid_rows').should('contain', 'No users found');

        // # Search for user2 that we know is no longer in the team
        cy.get('#channelMembers .DataGrid_search input').clear().type(user2.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // * Assert that no matching users found
        cy.get('#channelMembers .DataGrid_rows').should('contain', 'No users found');

        // # Open the add members modal
        cy.findByTestId('addChannelMembers').click();

        // # Enter user1 and user2 emails
        cy.get('#addUsersToChannelModal input').clear().type(`${user1.email}{enter}${user2.email}{enter}`);

        // # Confirm add the users
        cy.get('#addUsersToChannelModal #saveItems').click();

        // # Search for user1
        cy.get('#channelMembers .DataGrid_search input').clear().type(user1.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // * Assert that the user is now added to the members block and contains text denoting that they are New
        cy.get('#channelMembers .DataGrid_rows').children(0).should('contain', user1.email).and('contain', 'New');

        // # Open the user role dropdown menu
        cy.get(`#userGridRoleDropdown_${user1.username}`).click();

        // * Verify that the menu is opened
        cy.get('.Menu__content').should('be.visible').within(() => {
            // # Make the user an admin
            cy.findByText('Make Channel Admin').should('be.visible');
            cy.findByText('Make Channel Admin').click();
        });

        // # Search for user2
        cy.get('#channelMembers .DataGrid_search input').clear().type(user2.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // * Assert that the user is now added to the members block and contains text denoting that they are New
        cy.get('#channelMembers .DataGrid_rows').children(0).should('contain', user2.email).and('contain', 'New');

        // # Search for sysadmin
        cy.get('#channelMembers .DataGrid_search input').clear().type(sysadmin.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes

        // * Assert that searching for users after adding users returns only relevant search results
        cy.get('#channelMembers .DataGrid_rows').children(0).should('contain', sysadmin.email);

        // # Attempt to save
        saveConfig();

        // # Visit the channel page
        cy.visit(`/admin_console/user_management/channels/${channel.id}`);

        // # Search user1 that we know is now in the team again
        cy.get('#channelMembers .DataGrid_search input').scrollIntoView().clear().type(user1.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes
        cy.get('#channelMembers .DataGrid_loading').should('not.be.visible');

        // * Assert that the user is now saved as an admin
        cy.get('#channelMembers .DataGrid_rows').children(0).should('contain', user1.email).and('not.contain', 'New').and('contain', 'Channel Admin');

        // # Open the user role dropdown menu
        cy.get(`#userGridRoleDropdown_${user1.username}`).click();

        // * Verify that the menu is opened
        cy.get('.Menu__content').should('be.visible').within(() => {
            // # Make the user a regular member again
            cy.findByText('Make Channel Member').should('be.visible').click();
        });

        // * Assert user1 is now back to being a regular member
        cy.get('#channelMembers .DataGrid_rows').children(0).should('contain', user1.email).and('not.contain', 'New').and('contain', 'Channel Member');

        // # Search user2 that we know is now in the team again
        cy.get('#channelMembers .DataGrid_search input').scrollIntoView().clear().type(user2.email);
        cy.wait(TIMEOUTS.TINY); // Timeout required to wait for timeout that happens when search input changes
        cy.get('#channelMembers .DataGrid_loading').should('not.be.visible');

        // * Assert user2 is now saved as a regular member
        cy.get('#channelMembers .DataGrid_rows').children(0).should('contain', user2.email).and('not.contain', 'New').and('contain', 'Channel Member');

        // # Attempt to save
        saveConfig();
    });
});
