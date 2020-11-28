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
import {getAdminAccount} from '../../../support/env';

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
    before(() => {
        // # Login as new user and visit town-square.
        cy.apiInitSetup({loginAfter: true}).then(({user}) => {
            testUser = user;
            cy.apiLogout();
        });
    });

    beforeEach(() => {
        // # Login as system admin.
        cy.apiAdminLogin();

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
        const sysadmin = getAdminAccount();

        // # Search for the admin.
        cy.get('#searchUsers').type(sysadmin.username).wait(TIMEOUTS.HALF_SEC);

        // # Open the actions menu.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .text-right a').
            click().wait(TIMEOUTS.HALF_SEC);

        // # Click the Reset Password menu option.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .MenuWrapperAnimation-enter-done').
            find('li').eq(2).click().wait(TIMEOUTS.HALF_SEC);

        // # Type current password and a new password.
        cy.get('input[type=password]').eq(0).type(sysadmin.password);
        cy.get('input[type=password]').eq(1).type('new' + sysadmin.password);

        // # Click the 'Cancel' button.
        cy.get('button[type=button].btn.btn-link').should('contain', 'Cancel').click().wait(TIMEOUTS.HALF_SEC);

        // # Log out.
        cy.apiLogout();

        // * Verify that logging in with the old password works.
        cy.apiAdminLogin();
    });

    it('MM-T934 Users - System admin changes own password - Incorrect old password', () => {
        const sysadmin = getAdminAccount();

        // # Search for the admin.
        cy.get('#searchUsers').type(sysadmin.username).wait(TIMEOUTS.HALF_SEC);

        // # Open the actions menu.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .text-right a').
            click().wait(TIMEOUTS.HALF_SEC);

        // # Click the Reset Password menu option.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .MenuWrapperAnimation-enter-done').
            find('li').eq(2).click().wait(TIMEOUTS.HALF_SEC);

        // # Type wrong current password and a new password.
        cy.get('input[type=password]').eq(0).type('wrong' + sysadmin.password);
        cy.get('input[type=password]').eq(1).type('new' + sysadmin.password);

        // # Click the 'Reset' button.
        cy.get('button[type=submit] span').should('contain', 'Reset').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify the appropriate error is returned.
        cy.get('form.form-horizontal').find('.has-error p.error').should('be.visible').
            and('contain', 'The "Current Password" you entered is incorrect. Please check that Caps Lock is off and try again.');
    });

    it('MM-T935 Users - System admin changes own password - Invalid new password', () => {
        const sysadmin = getAdminAccount();

        // # Search for the admin.
        cy.get('#searchUsers').type(sysadmin.username).wait(TIMEOUTS.HALF_SEC);

        // # Open the actions menu.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .text-right a').
            click().wait(TIMEOUTS.HALF_SEC);

        // # Click the Reset Password menu option.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .MenuWrapperAnimation-enter-done').
            find('li').eq(2).click().wait(TIMEOUTS.HALF_SEC);

        // # Type current password and a new too short password.
        cy.get('input[type=password]').eq(0).type(sysadmin.password);
        cy.get('input[type=password]').eq(1).type('new');

        // # Click the 'Reset' button.
        cy.get('button[type=submit] span').should('contain', 'Reset').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify the appropriate error is returned.
        cy.get('form.form-horizontal').find('.has-error p.error').should('be.visible').
            and('contain', 'Your password must contain between 5 and 64 characters.');
    });

    it('MM-T936 Users - System admin changes own password - Blank fields', () => {
        const sysadmin = getAdminAccount();

        // # Search for the admin.
        cy.get('#searchUsers').type(sysadmin.username).wait(TIMEOUTS.HALF_SEC);

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
        cy.get('input[type=password]').eq(0).type(sysadmin.password);

        // # Click the 'Reset' button.
        cy.get('button[type=submit] span').should('contain', 'Reset').click().wait(TIMEOUTS.HALF_SEC);

        // * Verify the appropriate error is returned.
        cy.get('form.form-horizontal').find('.has-error p.error').should('be.visible').
            and('contain', 'Your password must contain between 5 and 64 characters.');
    });

    it('MM-T937 Users - System admin changes own password - Successfully changed', () => {
        const sysadmin = getAdminAccount();

        // # Search for the admin.
        cy.get('#searchUsers').type(sysadmin.username).wait(TIMEOUTS.HALF_SEC);

        // # Open the actions menu.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .text-right a').
            click().wait(TIMEOUTS.HALF_SEC);

        // # Click the Reset Password menu option.
        cy.get('[data-testid="userListRow"] .more-modal__right .more-modal__actions .MenuWrapper .MenuWrapperAnimation-enter-done').
            find('li').eq(2).click().wait(TIMEOUTS.HALF_SEC);

        // # Type current and new passwords..
        cy.get('input[type=password]').eq(0).type(sysadmin.password);
        cy.get('input[type=password]').eq(1).type('new' + sysadmin.password);

        // # Click the 'Reset' button.
        cy.get('button[type=submit] span').should('contain', 'Reset').click().wait(TIMEOUTS.HALF_SEC);

        // # Log out.
        cy.apiLogout();

        // * Verify that logging in with old password returns an error.
        apiLogin(sysadmin.username, sysadmin.password).then((response) => {
            expect(response.status).to.equal(401);

            // * Verify that logging in with new password works.
            sysadmin.password = 'new' + sysadmin.password;
            cy.apiLogin(sysadmin);

            // # Reset admin's password to the original.
            cy.apiResetPassword('me', sysadmin.password, sysadmin.password.substr(3));
        });
    });
});
