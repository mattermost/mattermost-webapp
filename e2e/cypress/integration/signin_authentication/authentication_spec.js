// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getEmailUrl} from '../../utils';
import {getAdminAccount} from '../../support/env';
import timeouts from '../../fixtures/timeouts';

const authenticator = require('authenticator');

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @signin_authentication

describe('Authentication', () => {
    let testTeam;
    let testTeam2;
    let testUser;
    let testUser2;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;
        });

        cy.apiCreateUser().then(({user: user2}) => {
            testUser2 = user2;
            cy.apiAddUserToTeam(testTeam.id, testUser2.id);
        });

        cy.apiCreateTeam().then(({team}) => {
            testTeam2 = team;
            cy.apiAddUserToTeam(testTeam2.id, testUser.id);
            cy.apiAddUserToTeam(testTeam2.id, testUser2.id);
        });

        cy.apiLogout();
    });

    afterEach(() => {
        cy.apiLogout();
    });

    it('MM-T404 Set up Multi-factor Authentication (Email login) - Enabled but not enforced', () => {
        // # On a server with MFA enabled (but not enforced).
        cy.apiAdminLogin();
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: true,
            },
        });

        cy.apiLogin(testUser);

        // # Go to Account Settings > Security > Multi-factor Authentication > Edit
        cy.visit(`/${testTeam.name}/channels/town-square`).wait(timeouts.ONE_SEC);

        cy.toAccountSettingsModal();

        // * Check that the Security tab is loaded
        cy.get('#securityButton').should('be.visible').click();
        cy.get('#mfaEdit').should('be.visible').click();
        cy.findByText('Add MFA to Account').should('be.visible').click();

        getUserSecret(testUser).then(({secret}) => {
            // # Logout
            cy.apiLogout();

            // # Enter credentials to log in
            cy.visit('/login');
            fillCredentialsForUser(testUser);

            // # Enter *incorrect* MFA token and verify it doesn't log you in
            fillMFACode('123456');
            cy.findByText('Invalid MFA token.').should('be.visible');

            // # Verify taken back to login page, re-enter credentials (if they're not already filled in)
            fillCredentialsForUser(testUser);

            // # Enter correct MFA token
            const token = authenticator.generateToken(secret);
            fillMFACode(token);

            // * Multifactor Authentication is enabled, and login is successful only after entering the MFA code.
            cy.url().should('include', 'town-square');
        });
    });

    it('MM-T405 MFA - Remove', () => {
        cy.apiAdminLogin();

        // # Ensure MFA is enabled but not enforced (System Console > MFA)
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: true,
            },
        });

        cy.apiGenerateMfaSecret(testUser.id).then((res) => {
            let token = authenticator.generateToken(res.code.secret);
            cy.apiActivateUserMFA(testUser.id, true, token);
            cy.apiLogout();

            // # Sign in with an account using Email Authentication and MFA
            cy.visit('/login');
            fillCredentialsForUser(testUser);
            token = authenticator.generateToken(res.code.secret);
            fillMFACode(token);

            // # Go to Account Settings
            cy.toAccountSettingsModal();

            // # Go to Security > Multi-factor Authentication > Edit and Remove MFA
            cy.get('#securityButton').should('be.visible').click();
            cy.get('#mfaEdit').should('be.visible').click();
            cy.findByText('Remove MFA from Account').should('be.visible').click();

            // # Log out
            cy.apiLogout();

            // # Log in again
            cy.visit('/login');
            fillCredentialsForUser(testUser);

            // * Login should be successful without having to enter an MFA code.
            cy.url().should('include', 'town-square');
        });
    });

    it('MM-T406 Sign In Forgot password - Email address not on server (but valid) Focus in login field on login page', () => {
        // # On a server with site URL and email settings configured (such as rc.test.mattermost.com):
        // # Go to the login page where you enter username & password
        cy.visit('/login').wait(timeouts.FIVE_SEC);

        // # Verify focus is in first login field
        cy.focused().should('have.id', 'loginId');

        // # Click "I forgot my password"
        cy.findByText('I forgot my password.').should('be.visible').click();
        cy.url().should('contain', '/reset_password');

        // # Enter an email that doesn't have an account on the server (but that you CAN receive email at)
        cy.findByPlaceholderText('Email').type('test@test.com');

        cy.findByText('Reset my password').should('be.visible').click();

        // * User redirected to a page with message
        // "If the account exists, a password reset email will be sent to: [email address]. Please check your inbox."
        cy.get('#passwordResetEmailSent').should('be.visible').within(() => {
            cy.get('span').first().should('have.text', 'If the account exists, a password reset email will be sent to:');
            cy.get('div b').first().should('have.text', 'test@test.com');
            cy.get('span').last().should('have.text', 'Please check your inbox.');
        });

        const baseUrl = Cypress.config('baseUrl');
        const mailUrl = getEmailUrl(baseUrl);

        // * Verify reset email is not sent.
        cy.task('getRecentEmail', {username: testUser.username, mailUrl}).then((response) => {
            // Last email should be something else for the test user.
            expect(response.data.subject).not.equal('[Mattermost] Reset your password');
        });
    });

    it('MM-T409 Logging out clears currently logged in user from the store', () => {
        // # Login as user A and switch to a different team and channel
        cy.visit('/login');
        fillCredentialsForUser(testUser);

        cy.visit(`/${testTeam.name}/channels/off-topic`).wait(timeouts.ONE_SEC);

        // # Logout
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#logout').scrollIntoView().should('be.visible').click();

        // # Login as user B and switch to a different team and channel
        cy.visit('/login');
        fillCredentialsForUser(testUser2);

        cy.visit(`/${testTeam2.name}/channels/town-square`).wait(timeouts.ONE_SEC);

        // # Logout
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#logout').scrollIntoView().should('be.visible').click();

        // # Login as user A again, observe you're viewing the team/channel you switched to in step 1
        cy.visit('/login');
        fillCredentialsForUser(testUser);

        cy.url().should('include', `/${testTeam.name}/channels/off-topic`);

        // # Logout
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#logout').should('be.visible').click();

        // # Login as user B again, observe you're viewing the team/channel you switched to in step 2
        cy.visit('/login');
        fillCredentialsForUser(testUser2);

        cy.url().should('include', `/${testTeam2.name}/channels/town-square`);
    });

    it('MM-T419 Desktop session expires when the focus is on the tab', () => {
        Cypress.on('window:before:load', (win) => {
            function Notification(title, opts) {
                this.title = title;
                this.opts = opts;
            }

            Notification.requestPermission = () => 'granted';
            Notification.close = () => true;

            win.Notification = Notification;

            cy.stub(win, 'Notification').as('withNotification');
        });

        cy.visit('/login');
        fillCredentialsForUser(testUser);

        // # From Account Settings, set your desktop notifications to Never (if not already done)
        // Click hamburger main menu.
        cy.get('#sidebarHeaderDropdownButton').click();

        // Click "Account settings"
        cy.findByText('Account Settings').should('be.visible').click();

        // Check that the "Account Settings" modal was opened.
        cy.get('#accountSettingsModal').should('exist').within(() => {
            // Click "Notifications"
            cy.findByText('Notifications').should('be.visible').click();

            // Click "Desktop"
            cy.findByText('Desktop Notifications').should('be.visible').click();

            // # Set your desktop notifications to Never
            cy.get('#desktopNotificationNever').check();

            // Click "Save"
            cy.findByText('Save').scrollIntoView().should('be.visible').click();

            // Close the modal.
            cy.get('#accountSettingsHeader').find('button').should('be.visible').click();
        });

        cy.visit(`/${testTeam.name}/channels/town-square`).wait(timeouts.ONE_SEC);

        // # From a separate browser session, login to the same server as the same user
        // # Click the hamburger menu and select Account Settings ➜ Security
        // # Click "View and Logout of Active Sessions", then find and close the session created in step 1
        // Since we are testing this on browser, we can revoke sessions with admin user.
        const sysadmin = getAdminAccount();
        cy.externalRequest({user: sysadmin, method: 'post', path: `users/${testUser.id}/sessions/revoke/all`}).wait(timeouts.HALF_MIN);

        // # Go back and view the original session app/browser, and wait until you see a desktop notification (may take up to a minute)
        // * Desktop notification is sent (may take up to 1 min)
        cy.get('@withNotification').should('have.been.calledOnce').and('have.been.calledWithMatch', 'Mattermost', ({body}) => {
            const expected = 'Session Expired: Please sign in to continue receiving notifications.';
            expect(body, `Notification body: "${body}" should match: "${expected}"`).to.equal(expected);
            return true;
        });

        // * Login page shows a message above the login box that the session has expired.
        cy.get('#login_section .alert-warning', {timeout: timeouts.ONE_MIN}).should('contain.text', 'Your session has expired. Please log in again.');
    });
});

function getUserSecret(user) {
    return cy.url().then((url) => {
        if (url.includes('mfa/setup')) {
            return cy.get('#mfa').wait(timeouts.HALF_SEC).find('.col-sm-12').then((p) => {
                const secretp = p.text();
                const secret = secretp.split(' ')[1];

                const token = authenticator.generateToken(secret);
                cy.get('#mfa').find('.form-control').type(token);
                cy.get('#mfa').find('.btn.btn-primary').click();

                cy.wait(timeouts.HALF_SEC);
                cy.get('#mfa').find('.btn.btn-primary').click();
                return cy.wrap({secret});
            });
        }

        // # If the user already has MFA enabled, reset the secret.
        return cy.apiGenerateMfaSecret(user.id).then((res) => {
            const secret = res.code.secret;
            return cy.wrap({secret});
        });
    });
}

function fillCredentialsForUser(user) {
    cy.wait(timeouts.TWO_SEC);
    cy.get('#loginId').should('be.visible').clear().type(user.username).wait(timeouts.ONE_SEC);
    cy.get('#loginPassword').should('be.visible').clear().type(user.password).wait(timeouts.ONE_SEC);
    cy.findByText('Sign in').click().wait(timeouts.ONE_SEC);
}

function fillMFACode(code) {
    cy.wait(timeouts.TWO_SEC);
    cy.findByPlaceholderText('MFA Token').clear().type(code).wait(timeouts.ONE_SEC);
    cy.get('#saveSetting').should('be.visible').click().wait(timeouts.ONE_SEC);
}
