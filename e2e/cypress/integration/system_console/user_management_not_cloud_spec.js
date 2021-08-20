// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console @not_cloud

const TIMEOUTS = require('../../fixtures/timeouts');

describe('User Management', () => {
    let testTeam;
    let testChannel;
    let sysadmin;
    let testUser;
    let otherUser;

    before(() => {
        cy.shouldNotRunOnCloudEdition();

        cy.apiInitSetup().then(({team, channel, user}) => {
            testChannel = channel;
            testTeam = team;
            testUser = user;
            return cy.apiCreateUser();
        }).then(({user: user2}) => {
            otherUser = user2;
        });

        cy.apiAdminLogin().then((res) => {
            sysadmin = res.user;
        });
    });

    it('MM-T942 Users - Deactivated user not in drop-down, auto-logged out', () => {
        cy.apiLogin(testUser);

        // # Create a direct channel between two users
        cy.apiCreateDirectChannel([testUser.id, otherUser.id]).then(() => {
            // # Visit the channel using the channel name
            cy.visit(`/${testTeam.name}/channels/${testUser.id}__${otherUser.id}`);
            cy.postMessage('hello');
        });

        cy.apiLogout().apiAdminLogin();
        activateUser(otherUser, false);
        cy.apiLogout().wait(TIMEOUTS.FIVE_SEC);

        cy.visit('/login');

        // # Login as otherUser
        cy.get('#loginId').should('be.visible').type(otherUser.username);
        cy.get('#loginPassword').should('be.visible').type(otherUser.password);
        cy.get('#loginButton').should('be.visible').click();

        // * Verify appropriate error message is displayed for deactivated user
        cy.findByText('Login failed because your account has been deactivated. Please contact an administrator.').should('exist').and('be.visible');

        cy.apiLogin(testUser);

        // visit test channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // # Click View Members
        cy.get('#sidebarDropdownMenu #viewMembers').should('be.visible').click();

        // * Check View Members modal dialog
        cy.get('#teamMembersModal').should('be.visible').within(() => {
            cy.get('#searchUsersInput').should('be.visible').type(otherUser.email, {delay: TIMEOUTS.ONE_HUNDRED_MILLIS});

            // * Deactivated user does not show up in View Members for teams
            cy.findByTestId('noUsersFound').should('be.visible');
            cy.findByLabelText('Close').click();
        });

        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Click Channel Members
        cy.get('#channelMember').should('be.visible').click();

        // # Click View Members
        cy.get('#member-list-popover').within(() => {
            cy.findByText('Manage Members').click();
        });

        // * Deactivated user does not show up in View Members for channels
        cy.get('#channelMembersModal').should('be.visible').within(() => {
            cy.get('#searchUsersInput').should('be.visible').type(otherUser.email, {delay: TIMEOUTS.ONE_HUNDRED_MILLIS});
            cy.findByTestId('noUsersFound').should('be.visible');
            cy.findByLabelText('Close').click();
        });

        // * User does show up in DM More menu so that DM channels can be viewed.
        cy.uiGetLhsSection('DIRECT MESSAGES').findByText(otherUser.username).should('not.exist');
        cy.uiAddDirectMessage().click();

        // * Verify that new messages cannot be posted.
        cy.get('#moreDmModal').should('be.visible').within(() => {
            cy.get('#selectItems input').type(otherUser.email + '{enter}').wait(TIMEOUTS.HALF_SEC);
            cy.get('#post_textbox').should('not.exist');
        });

        // # Restore the user.
        cy.apiLogout().apiAdminLogin();
        activateUser(otherUser, true);
    });

    it('MM-T943 Users - Deactivate a user - DM, GM in LHS (not actively viewing DM in another window)', () => {
        cy.apiLogin(testUser);

        // # Open a DM with a user you want to deactivate, post a message
        cy.apiCreateDirectChannel([testUser.id, otherUser.id]).then(() => {
            cy.visit(`/${testTeam.name}/channels/${testUser.id}__${otherUser.id}`);
            cy.postMessage(':)');
        });

        // # Also open a GM with that user and a third user, post a message.
        cy.apiCreateGroupChannel([sysadmin.id, otherUser.id, testUser.id]).then(({channel}) => {
            cy.visit(`/${testTeam.name}/channels/${channel.name}`);
            cy.postMessage('hello');
        });

        const displayName = [sysadmin, otherUser].
            map((member) => member.username).
            sort((a, b) => a.localeCompare(b, 'en', {numeric: true})).
            join(', ');

        // # Observe DM and GM in LHS.
        cy.uiGetLhsSection('DIRECT MESSAGES').findByText(displayName).should('be.visible');
        cy.uiGetLhsSection('DIRECT MESSAGES').findByText(otherUser.username).should('be.visible');

        // # System Console > Users Deactivate the user.
        cy.apiLogout().apiAdminLogin();
        activateUser(otherUser, false);

        // # Go back to view team.
        cy.apiLogin(testUser).visit(`/${testTeam.name}/channels/${testChannel.name}`).wait(TIMEOUTS.HALF_SEC);

        // * On returning to the team the DM has been removed from LHS.
        cy.uiGetLhsSection('DIRECT MESSAGES').findByText(otherUser.username).should('not.exist');

        // * GM stays in LHS channel list.
        cy.uiGetLhsSection('DIRECT MESSAGES').findByText(displayName).should('be.visible');

        // # Open GM channel.
        cy.uiGetLhsSection('DIRECT MESSAGES').findByText(displayName).click().wait(TIMEOUTS.HALF_SEC);

        // * GM still has message box (is not archived)
        cy.findByTestId('post_textbox').should('be.visible');

        // # Restore the user.
        cy.apiLogout().apiAdminLogin();
        activateUser(otherUser, true);
    });

    function activateUser(user, activate) {
        cy.visit('/admin_console/user_management/users');

        // # Search for the user.
        cy.get('#searchUsers').clear().type(user.email, {delay: TIMEOUTS.ONE_HUNDRED_MILLIS}).wait(TIMEOUTS.HALF_SEC);

        cy.findByTestId('userListRow').within(() => {
            if (activate) {
                cy.findByText('Inactive').click().wait(TIMEOUTS.HALF_SEC);

                // # Click on the "Activate" button.
                cy.findByLabelText('User Actions Menu').findByText('Activate').click();
            } else {
                cy.findByText('Member').click().wait(TIMEOUTS.HALF_SEC);

                // # Click on the "Deactivate" button.
                cy.findByLabelText('User Actions Menu').findByText('Deactivate').click();
            }
        });

        if (!activate) {
            // # Verify the modal opened and then confirm.
            cy.get('#confirmModal').should('exist').within(() => {
                cy.get('#confirmModalButton').click().wait(TIMEOUTS.HALF_SEC);
            });
        }
    }
});
