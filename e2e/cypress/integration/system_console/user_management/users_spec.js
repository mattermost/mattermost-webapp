// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';
import * as MESSAGES from '../../../fixtures/messages';

import {getRandomId} from '../../../utils';

function apiLogin(username, password) {
    return cy.request({
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        url: '/api/v4/users/login',
        method: 'POST',
        body: {login_id: username, password},
        failOnStatusCode: false,
    });
}

describe('System Console > User Management > Users', () => {
    let testUser;
    let otherAdmin;

    before(() => {
        cy.apiInitSetup().then(({user}) => {
            testUser = user;
        });

        // # Create other sysadmin
        cy.apiCreateCustomAdmin().then(({sysadmin}) => {
            otherAdmin = sysadmin;
        });
    });

    beforeEach(() => {
        // # Login as other admin.
        cy.apiLogin(otherAdmin);

        // # Visit the system console.
        cy.visit('/admin_console').wait(TIMEOUTS.ONE_SEC);

        // # Go to the Server Logs section.
        cy.get('#user_management\\/users').click().wait(TIMEOUTS.ONE_SEC);
    });

    it('MM-T932 Users - Change a user\'s password', () => {
        // # Search for the user.
        cy.get('#searchUsers').type(testUser.email).wait(TIMEOUTS.HALF_SEC);

        // # Open the actions menu.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .text-right a').
            click().wait(TIMEOUTS.HALF_SEC);

        // # Click the Reset Password menu option.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .MenuWrapperAnimation-enter-done').
            find('li').eq(3).click().wait(TIMEOUTS.HALF_SEC);

        // # Type new password and submit.
        cy.get('input[type=password]').type('new' + testUser.password);
        cy.get('button[type=submit]').should('contain', 'Reset').click().wait(TIMEOUTS.HALF_SEC);

        // # Log out.
        cy.apiLogout();

        // * Verify that logging in with old password returns an error.
        apiLogin(testUser.username, testUser.password).then((response) => {
            expect(response.status).to.equal(401);

            // * Verify that logging in with the updated password works.
            testUser.password = 'new' + testUser.password;
            cy.apiLogin(testUser);

            // # Log out.
            cy.apiLogout();
        });
    });

    it('MM-T933 Users - System admin changes own password - Cancel out of changes', () => {
        // # Search for the admin.
        cy.get('#searchUsers').type(otherAdmin.username).wait(TIMEOUTS.HALF_SEC);

        // # Open the actions menu.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .text-right a').
            click().wait(TIMEOUTS.HALF_SEC);

        // # Click the Reset Password menu option.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .MenuWrapperAnimation-enter-done').
            find('li').eq(2).click().wait(TIMEOUTS.HALF_SEC);

        // # Type current password and a new password.
        cy.get('input[type=password]').eq(0).type(otherAdmin.password);
        cy.get('input[type=password]').eq(1).type('new' + otherAdmin.password);

        // # Click the 'Cancel' button.
        cy.get('button[type=button].btn.btn-link').should('contain', 'Cancel').click().wait(TIMEOUTS.HALF_SEC);

        // # Log out.
        cy.apiLogout();

        // * Verify that logging in with the old password works.
        cy.apiLogin(otherAdmin);
    });

    it('MM-T934 Users - System admin changes own password - Incorrect old password', () => {
        // # Search for the admin.
        cy.get('#searchUsers').type(otherAdmin.username).wait(TIMEOUTS.HALF_SEC);

        // # Open the actions menu.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .text-right a').
            click().wait(TIMEOUTS.HALF_SEC);

        // # Click the Reset Password menu option.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .MenuWrapperAnimation-enter-done').
            find('li').eq(2).click().wait(TIMEOUTS.HALF_SEC);

        // # Type wrong current password and a new password.
        cy.get('input[type=password]').eq(0).type('wrong' + otherAdmin.password);
        cy.get('input[type=password]').eq(1).type('new' + otherAdmin.password);

        // # Click the 'Reset' button.
        cy.get('button[type=submit] span').should('contain', 'Reset').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify the appropriate error is returned.
        cy.get('form.form-horizontal').find('.has-error p.error').should('be.visible').
            and('contain', 'The "Current Password" you entered is incorrect. Please check that Caps Lock is off and try again.');
    });

    it('MM-T935 Users - System admin changes own password - Invalid new password', () => {
        // # Search for the admin.
        cy.get('#searchUsers').type(otherAdmin.username).wait(TIMEOUTS.HALF_SEC);

        // # Open the actions menu.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .text-right a').
            click().wait(TIMEOUTS.HALF_SEC);

        // # Click the Reset Password menu option.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .MenuWrapperAnimation-enter-done').
            find('li').eq(2).click().wait(TIMEOUTS.HALF_SEC);

        // # Type current password and a new too short password.
        cy.get('input[type=password]').eq(0).type(otherAdmin.password);
        cy.get('input[type=password]').eq(1).type('new');

        // # Click the 'Reset' button.
        cy.get('button[type=submit] span').should('contain', 'Reset').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify the appropriate error is returned.
        cy.get('form.form-horizontal').find('.has-error p.error').should('be.visible').
            and('contain', 'Your password must contain between 5 and 64 characters.');
    });

    it('MM-T936 Users - System admin changes own password - Blank fields', () => {
        // # Search for the admin.
        cy.get('#searchUsers').type(otherAdmin.username).wait(TIMEOUTS.HALF_SEC);

        // # Open the actions menu.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .text-right a').
            click().wait(TIMEOUTS.HALF_SEC);

        // # Click the Reset Password menu option.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .MenuWrapperAnimation-enter-done').
            find('li').eq(2).click().wait(TIMEOUTS.HALF_SEC);

        // # Click the 'Reset' button.
        cy.get('button[type=submit] span').should('contain', 'Reset').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify the appropriate error is returned.
        cy.get('form.form-horizontal').find('.has-error p.error').should('be.visible').
            and('contain', 'Please enter your current password.');

        // # Type current password, leave new password blank.
        cy.get('input[type=password]').eq(0).type(otherAdmin.password);

        // # Click the 'Reset' button.
        cy.get('button[type=submit] span').should('contain', 'Reset').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify the appropriate error is returned.
        cy.get('form.form-horizontal').find('.has-error p.error').should('be.visible').
            and('contain', 'Your password must contain between 5 and 64 characters.');
    });

    it('MM-T937 Users - System admin changes own password - Successfully changed', () => {
        // # Search for the admin.
        cy.get('#searchUsers').type(otherAdmin.username).wait(TIMEOUTS.HALF_SEC);

        // # Open the actions menu.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .text-right a').
            click().wait(TIMEOUTS.HALF_SEC);

        // # Click the Reset Password menu option.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .MenuWrapperAnimation-enter-done').
            find('li').eq(2).click().wait(TIMEOUTS.HALF_SEC);

        // # Type current and new passwords..
        cy.get('input[type=password]').eq(0).type(otherAdmin.password);
        cy.get('input[type=password]').eq(1).type('new' + otherAdmin.password);

        // # Click the 'Reset' button.
        cy.get('button[type=submit] span').should('contain', 'Reset').click().wait(TIMEOUTS.HALF_SEC);

        // # Log out.
        cy.apiLogout();

        // * Verify that logging in with old password returns an error.
        apiLogin(otherAdmin.username, otherAdmin.password).then((response) => {
            expect(response.status).to.equal(401);

            // * Verify that logging in with new password works.
            otherAdmin.password = 'new' + otherAdmin.password;
            cy.apiLogin(otherAdmin);

            // # Reset admin's password to the original.
            cy.apiResetPassword('me', otherAdmin.password, otherAdmin.password.substr(3));
        });
    });
});

describe('System Console > User Management > Deactivation', () => {
    let team1;
    before(() => {
        // # Do initial setup
        cy.apiInitSetup().then(({team}) => {
            team1 = team;
        });
    });

    beforeEach(() => {
        // # Visit town-square
        cy.visit(`/${team1.name}`);
    });

    // # Create two users
    it('MM-T946 GM: User deactivated in System Console still displays', () => {
        cy.apiCreateUser({prefix: 'first'}).then(({user: user1}) => {
            cy.apiCreateUser({prefix: 'second'}).then(({user: user2}) => {
                const message = MESSAGES.SMALL;

                // # Send a GM to them
                cy.sendDirectMessageToUsers([user1, user2], message);

                // * Verify names on the LHS are still ordered alphabetically
                cy.get('#directChannelList .active .sidebar-item__name').should('contain', user1.username + ', ' + user2.username);

                // # Deactivate user 1
                cy.apiDeactivateUser(user1.id);

                // * Verify names on the LHS are still ordered alphabetically
                cy.get('#directChannelList .active .sidebar-item__name').should('contain', user1.username + ', ' + user2.username);

                // # Search for the message send in the GM
                cy.uiSearchPosts(message);

                // * Verify GM message is returned in RHS
                cy.get('#search-items-container').children().should('have.length', 1).get('#search-items-container .post-message__text-container').should('have.text', message);
            });
        });
    });

    it('MM-T948 DM posts searchable in DM More... and channel switcher DM channel re-openable', () => {
        cy.apiCreateUser({prefix: 'other'}).then(({user: other}) => {
            // # Open DM
            cy.sendDirectMessageToUser(other, MESSAGES.SMALL);

            // # Close DM
            cy.get('#channelHeaderDropdownIcon').click();
            cy.findByText('Close Direct Message').click();

            // # Deactivate the user
            cy.apiDeactivateUser(other.id);

            // # Open Channel Switcher
            cy.get('#sidebarSwitcherButton').click();

            // # Type the user name on Channel switcher input
            cy.get('#quickSwitchInput').type(other.username).wait(TIMEOUTS.HALF_SEC);

            // * Verify user is marked as deactivated
            cy.get('[data-testid="' + other.username + '"]').contains('Deactivated');

            // # Close Channel Switcher
            cy.get('#quickSwitchModalLabel .close').click();

            // # Open DM More... Modal
            cy.get('#moreDirectMessage').click();

            // # Type the guest user name on Channel switcher input
            cy.get('.more-direct-channels #selectItems').type(other.username).wait(TIMEOUTS.HALF_SEC);

            // * Verify user is marked as deactivated
            cy.get('#displayedUserName' + other.username).parent().contains('Deactivated');

            // # Click on the user
            cy.get('#displayedUserName' + other.username).click();

            // * Confirm DM More... Modal is closed
            cy.get('#moreDmModal').should('not.be.visible');
        });
    });

    it('MM-T949 If an active user is selected in DM More... or channel switcher, deactivated users disappear so they can\'t be added to a GM together', () => {
        // # Create two users
        cy.apiCreateUser({prefix: 'first'}).then(({user: user1}) => {
            cy.apiCreateUser({prefix: 'second_'}).then(({user: user2}) => {
                // # Send a DM to user1 so they show up in the DM modal
                cy.sendDirectMessageToUser(user1, MESSAGES.SMALL);

                // # Send a DM to user2 so they show up in the DM modal
                cy.sendDirectMessageToUser(user2, MESSAGES.SMALL);

                // # Deactivate user 2
                cy.apiDeactivateUser(user2.id);

                // # Open DM More... Modal
                cy.get('#moreDirectMessage').click().wait(TIMEOUTS.HALF_SEC);

                // # Type the user name of user1 on Channel switcher input
                cy.get('.more-direct-channels #selectItems').type(user1.username).wait(TIMEOUTS.HALF_SEC);

                // # Click on the user
                cy.get('#displayedUserName' + user1.username).click();

                // # Type the user name of user2 on Channel switcher input
                cy.get('.more-direct-channels #selectItems').type(user2.username).wait(TIMEOUTS.HALF_SEC);

                // * Confirm user2 can't be added to the DM
                cy.get('#displayedUserName' + user2.username).should('not.be.visible');
            });
        });
    });

    it('MM-T951 Reopened DM shows archived icon in LHS No status indicator in channel header Message box replaced with "You are viewing an archived channel with a deactivated user." in center and RHS', () => {
        // # Create other user
        cy.apiCreateUser({prefix: 'other'}).then(({user}) => {
            // # Send a DM to the other user
            cy.sendDirectMessageToUser(user, MESSAGES.SMALL);

            // # Open RHS
            cy.clickPostCommentIcon();

            // * Verify status indicator is shown in channel header
            cy.get('#channelHeaderDescription .status').should('be.visible');

            // # Deactivate other user
            cy.apiDeactivateUser(user.id);

            // * Verify center channel message box is replace with warning
            cy.get('.channel-archived__message').contains('You are viewing an archived channel with a deactivated user. New messages cannot be posted.');

            // * Verify RHS message box is replace with warning
            cy.get('#rhsContainer .post-create-message').contains('You are viewing an archived channel with a deactivated user. New messages cannot be posted.');

            // * Verify status indicator is not shown in channel header
            cy.get('#channelHeaderDescription .status').should('not.be.visible');

            // * Verify archived icon is shown in LHS
            cy.get('#directChannelList .active .icon__archive').scrollIntoView().should('be.visible');
        });
    });

    it('MM-T952 Reactivating a user results in them showing up in the normal spot in the list, without the `Deactivated` label.', () => {
        // # Create two users with same random prefix
        const id = getRandomId();

        cy.apiCreateUser({prefix: id + '_a_'}).then(({user: user1}) => {
            cy.apiCreateUser({prefix: id + '_b_'}).then(({user: user2}) => {
                // # Send a DM to user1 so they show up in the DM modal
                cy.sendDirectMessageToUser(user1, MESSAGES.SMALL);

                // # Send a DM to user2 so they show up in the DM modal
                cy.sendDirectMessageToUser(user2, MESSAGES.SMALL);

                // # Open DM More... Modal
                cy.get('#moreDirectMessage').click().wait(TIMEOUTS.HALF_SEC);

                // # Type the user name of the other user on Channel switcher input
                cy.get('.more-direct-channels #selectItems').type(id).wait(TIMEOUTS.HALF_SEC);

                // * Verify user 1 is shown first and doesn't have deactivated text
                cy.get('#moreDmModal .more-modal__row').siblings().its(0).get('#displayedUserName' + user1.username).parent().should('not.contain', 'Deactivated');

                // * Verify user 2 is shown second
                cy.get('#moreDmModal .more-modal__row').siblings().its(1).get('#displayedUserName' + user2.username);

                // # Deactivate user1
                cy.apiDeactivateUser(user1.id);

                // * Verify user 1 is shown second and does have deactivated text
                cy.get('#moreDmModal .more-modal__row').siblings().its(1).get('#displayedUserName' + user1.username).parent().should('contain', 'Deactivated');

                // * Verify user 2 is shown first
                cy.get('#moreDmModal .more-modal__row').siblings().its(0).get('#displayedUserName' + user2.username);

                // # Reactivate user1
                cy.apiActivateUser(user1.id);

                // * Verify user 1 is shown first and doesn't have deactivated text
                cy.get('#moreDmModal .more-modal__row').siblings().its(0).get('#displayedUserName' + user1.username).parent().should('not.contain', 'Deactivated');

                // * Verify user 2 is shown second
                cy.get('#moreDmModal .more-modal__row').siblings().its(1).get('#displayedUserName' + user2.username);
            });
        });
    });
});
