// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @guest_account

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import * as TIMEOUTS from '../../../fixtures/timeouts';
import {getRandomId} from '../../../utils';
import {getAdminAccount} from '../../../support/env';

function verifyGuest(userStatus = 'Guest ') {
    // * Verify if Guest User is displayed
    cy.findAllByTestId('userListRow').should('have.length', 1);
    cy.findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').and('have.text', userStatus);
}

describe('Guest Account - Verify Manage Guest Users', () => {
    const admin = getAdminAccount();
    let guestUser;
    let testTeam;
    let testChannel;

    before(() => {
        // * Check if server has license for Guest Accounts
        cy.apiRequireLicenseForFeature('GuestAccounts');

        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
        });

        // # Create team and guest user account
        cy.apiInitSetup().then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;

            cy.apiCreateGuestUser().then(({guest}) => {
                guestUser = guest;

                cy.apiAddUserToTeam(testTeam.id, guestUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, guestUser.id);
                });
            });
        });

        // # Visit System Console Users page
        cy.visit('/admin_console/user_management/users');
    });

    beforeEach(() => {
        // # Reload current page before each test
        cy.reload();

        // # Search for Guest User by username
        cy.get('#searchUsers').should('be.visible').type(guestUser.username);
    });

    it('MM-18048 Verify the manage options displayed for Guest User', () => {
        // * Verify Guest user
        verifyGuest();

        // # Click on the Manage User option
        cy.wait(TIMEOUTS.HALF_SEC).findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();

        // * Verify the manage options which should be displayed for Guest User
        const includeOptions = ['Deactivate', 'Manage Teams', 'Reset Password', 'Update Email', 'Promote to User', 'Revoke Sessions'];
        includeOptions.forEach((includeOption) => {
            cy.findByText(includeOption).should('be.visible');
        });

        // * Verify the manage options which should not be displayed for Guest user
        const missingOptions = ['Manage Roles', 'Demote to Guest'];
        missingOptions.forEach((missingOption) => {
            cy.findByText(missingOption).should('not.exist');
        });
    });

    it('MM-18048 Deactivate Guest User and Verify', () => {
        // # Click on the Deactivate option
        cy.wait(TIMEOUTS.HALF_SEC).findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();
        cy.wait(TIMEOUTS.HALF_SEC).findByText('Deactivate').click();

        // * Verify the confirmation message displayed
        cy.get('#confirmModal').should('be.visible').within(() => {
            cy.get('#confirmModalLabel').should('be.visible').and('have.text', `Deactivate ${guestUser.username}`);
            cy.get('.modal-body').should('be.visible').and('have.text', `This action deactivates ${guestUser.username}. They will be logged out and not have access to any teams or channels on this system. Are you sure you want to deactivate ${guestUser.username}?`);
        });

        // * Verify the behavior when Cancel button in the confirmation message is clicked
        cy.get('#cancelModalButton').click();
        cy.get('#confirmModal').should('not.exist');
        verifyGuest();

        // * Verify the behavior when Deactivate button in the confirmation message is clicked
        cy.wait(TIMEOUTS.HALF_SEC).findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();
        cy.wait(TIMEOUTS.HALF_SEC).findByText('Deactivate').click();
        cy.get('#confirmModalButton').click();
        cy.get('#confirmModal').should('not.exist');
        verifyGuest('Inactive ');

        // # Reload and verify if behavior is same
        cy.reload();
        cy.get('#searchUsers').should('be.visible').type(guestUser.username);
        verifyGuest('Inactive ');
    });

    it('MM-18048 Activate Guest User and Verify', () => {
        // # Click on the Activate option
        cy.wait(TIMEOUTS.HALF_SEC).findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();
        cy.wait(TIMEOUTS.HALF_SEC).findByText('Activate').click();

        // * Verify if User's status is activated again
        verifyGuest();

        // # Reload and verify if behavior is same
        cy.reload();
        cy.get('#searchUsers').should('be.visible').type(guestUser.username);
        verifyGuest();
    });

    it('MM-18048 Change Email of a Guest User and Verify', () => {
        // # Click on the Update Email option
        cy.wait(TIMEOUTS.HALF_SEC).findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();
        cy.wait(TIMEOUTS.HALF_SEC).findByText('Update Email').click();

        // * Update email of Guest User
        const email = `temp-${getRandomId()}@mattermost.com`;
        cy.findByTestId('resetEmailModal').should('be.visible').within(() => {
            cy.findByTestId('resetEmailForm').should('be.visible').get('input').type(email);
            cy.findByTestId('resetEmailButton').click();
        });

        // * Verify if Guest's email was updated
        cy.findByText(email).should('be.visible');

        // # Reload and verify if behavior is same
        cy.reload();
        cy.get('#searchUsers').should('be.visible').type(guestUser.username);
        cy.findByText(email).should('be.visible');
    });

    it('MM-18048 Revoke Session of a Guest User and Verify', () => {
        // # Click on the Revoke Session option
        cy.wait(TIMEOUTS.HALF_SEC).findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();
        cy.wait(TIMEOUTS.HALF_SEC).findByText('Revoke Sessions').click();

        // * Verify the confirmation message displayed
        cy.get('#confirmModal').should('be.visible').within(() => {
            cy.get('#confirmModalLabel').should('be.visible').and('have.text', `Revoke Sessions for ${guestUser.username}`);
            cy.get('.modal-body').should('be.visible').and('have.text', `This action revokes all sessions for ${guestUser.username}. They will be logged out from all devices. Are you sure you want to revoke all sessions for ${guestUser.username}?`);
        });

        // * Verify the behavior when Cancel button in the confirmation message is clicked
        cy.get('#cancelModalButton').click();
        cy.get('#confirmModal').should('not.exist');

        // # Logout sysadmin and login as Guest User to verify if Revoke Session works
        cy.apiLogout();
        cy.apiLogin(guestUser);
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.get(`#sidebarItem_${testChannel.name}`).click({force: true});

        // # Issue a Request to Revoke All Sessions as SysAdmin
        const baseUrl = Cypress.config('baseUrl');
        cy.externalRequest({user: admin, method: 'post', baseUrl, path: `users/${guestUser.id}/sessions/revoke/all`}).then(() => {
            // # Initiate browser activity like visit on test channel
            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

            // * Verify if the regular member is logged out and redirected to login page
            cy.url({timeout: TIMEOUTS.HALF_MIN}).should('include', '/login');
            cy.get('#login_section', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible');
        });
    });
});
