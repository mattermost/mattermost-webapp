// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getEmailUrl, getEmailMessageSeparator, getRandomId} from '../../utils';

const TIMEOUTS = require('../../fixtures/timeouts');

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console

describe('User Management', () => {
    const newUsername = 'u' + getRandomId();
    const newEmailAddr = newUsername + '@sample.mattermost.com';
    let testUser;

    before(() => {
        cy.apiInitSetup().then(({user}) => {
            testUser = user;
        });
    });

    it('MM-T924 Users - Page through users list', () => {
        cy.visit('/admin_console/user_management/users').wait(TIMEOUTS.ONE_SEC);

        cy.get('#searchableUserListTotal').then((el) => {
            const count1 = el[0].innerText.replace(/\n/g, '').replace(/\s/g, ' ');

            // * Can page through several pages of users.
            cy.get('#searchableUserListNextBtn').should('be.visible').click();

            // * Count at top changes appropriately.
            cy.get('#searchableUserListTotal').then((el2) => {
                const count2 = el2[0].innerText.replace(/\n/g, '').replace(/\s/g, ' ');
                expect(count1).not.equal(count2);
            });

            // * Can page backward as well.
            cy.get('#searchableUserListPrevBtn').should('be.visible').click();
        });
    });

    it('MM-T928 Users - Change a user\'s email address', () => {
        cy.visit('/admin_console/user_management/users').wait(TIMEOUTS.ONE_SEC);

        // # Update config.
        cy.apiUpdateConfig({
            EmailSettings: {
                RequireEmailVerification: true,
            },
        });

        // * Blank email address: "Please enter a valid email address"
        resetUserEmail(testUser.email, '', 'Please enter a valid email address');

        // * Invalid email address: "Please enter a valid email address"
        resetUserEmail(testUser.email, 'user-1(at)sample.mattermost.com', 'Please enter a valid email address');

        // * Email address already in use: "This email is already taken. Please choose another."
        resetUserEmail(testUser.email, 'sysadmin@sample.mattermost.com', 'This email is already taken. Please choose another.');
    });

    it('MM-T929 Users - Change a user\'s email address, with verification off', () => {
        cy.visit('/admin_console/user_management/users').wait(TIMEOUTS.ONE_SEC);

        // # Update config.
        cy.apiUpdateConfig({
            EmailSettings: {
                RequireEmailVerification: false,
            },
        });

        // # System admin changes new user's email address.
        resetUserEmail(testUser.email, newEmailAddr, '');

        // # Updates immediately in Account Settings for the user.
        cy.get('#searchUsers').clear().type(newEmailAddr).wait(TIMEOUTS.HALF_SEC);
        cy.get('.more-modal__details').should('be.visible').within(() => {
            cy.findByText(newEmailAddr).should('exist');
        });

        // * User also receives email confirmation that email address has been changed.
        checkResetEmail(testUser.username, testUser.email);

        // # Logout, so that test user can login.
        cy.apiLogout();

        // * User cannot log in with old email address.
        apiLogin(testUser.email, testUser.password).then((response) => {
            expect(response.status).to.equal(401);

            // # User logs in with username /password (no verification needed), then logs out again
            cy.apiLogin({username: testUser.username, password: testUser.password}).apiLogout();

            // # User logs in with new email address /password (no verification needed)
            cy.apiLogin({username: newEmailAddr, password: testUser.password}).apiLogout();
        });

        // # Revert the changes.
        cy.apiAdminLogin();
        cy.visit('/admin_console/user_management/users').wait(TIMEOUTS.ONE_SEC);
        resetUserEmail(newEmailAddr, testUser.email, '');
    });

    it('MM-T930 Users - Change a user\'s email address, with verification on', () => {
        cy.visit('/admin_console/user_management/users').wait(TIMEOUTS.ONE_SEC);

        // # Update Configs.
        cy.apiUpdateConfig({
            EmailSettings: {
                RequireEmailVerification: true,
            },
        });

        resetUserEmail(testUser.email, newEmailAddr, '');

        cy.apiLogout();

        // # Type email and password.
        cy.get('#loginId').type(testUser.email);
        cy.get('#loginPassword').type(testUser.password);
        cy.findByText('Sign in').click();

        // * Verify that logging in with the old e-mail works but requires e-mail verification.
        cy.url().should('include', 'should_verify_email');

        // # Log out.
        cy.apiLogout();

        // Verify e-mail.
        verifyEmail(newUsername, newEmailAddr);
        cy.wait(TIMEOUTS.HALF_SEC);

        // * Verify that logging in with the old e-mail works.
        cy.apiLogin({username: newEmailAddr, password: testUser.password}).apiLogout();

        // # Revert the config.
        cy.apiAdminLogin();
        cy.apiUpdateConfig({
            EmailSettings: {
                RequireEmailVerification: false,
            },
        });
    });

    function resetUserEmail(oldEmail, newEmail, errorMsg) {
        // # Search for the user.
        cy.get('#searchUsers').clear().type(oldEmail).wait(TIMEOUTS.HALF_SEC);

        cy.findByTestId('userListRow').within(() => {
            // # Open the actions menu.
            cy.findByText('Member').click().wait(TIMEOUTS.HALF_SEC);

            // # Click the Update email menu option.
            cy.findByLabelText('User Actions Menu').findByText('Update Email').click().wait(TIMEOUTS.HALF_SEC);
        });

        // # Verify the modal opened.
        cy.findByTestId('resetEmailModal').should('exist');

        // # Type the new e-mail address.
        if (newEmail.length > 0) {
            cy.get('input[type=email]').eq(0).clear().type(newEmail);
        }

        // # Click the "Reset" button.
        cy.findByTestId('resetEmailButton').click();

        // * Check for the error messages, if any.
        if (errorMsg.length > 0) {
            cy.get('form.form-horizontal').find('.has-error p.error').should('be.visible').and('contain', errorMsg);

            // # Close the modal.
            cy.findByLabelText('Close').click();
        }
    }

    function checkResetEmail(username, userEmail) {
        const baseUrl = Cypress.config('baseUrl');
        const mailUrl = getEmailUrl(baseUrl);

        cy.task('getRecentEmail', {username, mailUrl}).then((response) => {
            const {data, status} = response;

            // # Should return success status.
            expect(status).to.equal(200);

            // # Verify that last email sent to expected address.
            expect(data.to.length).to.equal(1);
            expect(data.to[0]).to.contain(userEmail);

            // # Verify that the email subject is as expected.
            expect(data.subject).to.contain('Your email address has changed');
        });
    }

    function verifyEmail(username, userEmail) {
        const baseUrl = Cypress.config('baseUrl');
        const mailUrl = getEmailUrl(baseUrl);

        // # Verify e-mail through verification link.
        cy.task('getRecentEmail', {username, mailUrl}).then((response) => {
            const {data, status} = response;

            // # Should return success status.
            expect(status).to.equal(200);

            // # Verify that last email sent to expected address.
            expect(data.to.length).to.equal(1);
            expect(data.to[0]).to.contain(userEmail);

            // # Verify that the email subject is as expected.
            expect(data.subject).to.contain('Email Verification');

            // # Extract verification the link from the e-mail.
            const messageSeparator = getEmailMessageSeparator(baseUrl);
            const bodyText = data.body.text.split(messageSeparator);
            expect(bodyText[6]).to.contain('Verify Email');
            const line = bodyText[6].split(' ');
            expect(line[3]).to.contain(baseUrl);

            const verificationLink = line[3].replace(baseUrl, '');

            // # Complete verification.
            cy.visit(verificationLink);
        });
    }

    function apiLogin(username, password) {
        return cy.request({
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            url: '/api/v4/users/login',
            method: 'POST',
            body: {login_id: username, password},
            failOnStatusCode: false,
        });
    }
});
