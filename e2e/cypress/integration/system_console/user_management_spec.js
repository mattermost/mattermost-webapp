// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console

import {getEmailUrl, splitEmailBodyText, getRandomId} from '../../utils';

const TIMEOUTS = require('../../fixtures/timeouts');

describe('User Management', () => {
    const newUsername = 'u' + getRandomId();
    const newEmailAddr = newUsername + '@sample.mattermost.com';
    let testTeam;
    let testChannel;
    let sysadmin;
    let testUser;
    let otherUser;

    before(() => {
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

    it('MM-T924 Users - Page through users list', () => {
        cy.apiGetUsers().then(({users}) => {
            const minimumNumberOfUsers = 60;

            if (users.length < minimumNumberOfUsers) {
                Cypress._.times(minimumNumberOfUsers - users.length, () => {
                    cy.apiCreateUser();
                });
            }
        });

        cy.visit('/admin_console/user_management/users');

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
        cy.visit('/admin_console/user_management/users');

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
        cy.visit('/admin_console/user_management/users');

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
        cy.visit('/admin_console/user_management/users');
        resetUserEmail(newEmailAddr, testUser.email, '');
    });

    it('MM-T930 Users - Change a user\'s email address, with verification on', () => {
        cy.visit('/admin_console/user_management/users');

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
        cy.apiAdminLogin().apiUpdateConfig({
            EmailSettings: {
                RequireEmailVerification: false,
            },
        });

        resetUserEmail(newEmailAddr, testUser.email, '');
    });

    it('MM-T931 Users - Can\'t update a user\'s email address if user has other signin method', () => {
        // # Update config.
        cy.apiUpdateConfig({
            GitLabSettings: {
                Enable: true,
            },
        });
        cy.visit('/admin_console/user_management/users');

        cy.apiCreateUser().then(({user: gitlabUser}) => {
            cy.apiUpdateUserAuth(gitlabUser.id, gitlabUser.email, '', 'gitlab');

            // # Search for the user.
            cy.get('#searchUsers').clear().type(gitlabUser.email).wait(TIMEOUTS.HALF_SEC);

            cy.findByTestId('userListRow').within(() => {
                // # Open the actions menu.
                cy.findByText('Member').click().wait(TIMEOUTS.HALF_SEC);

                // # Click the Update email menu option.
                cy.findByLabelText('User Actions Menu').findByText('Update Email').should('not.exist');
            });
        });
    });

    it('MM-T941 Users - Revoke all sessions for unreachable users', () => {
        // # Login as a system user - User
        cy.apiLogin(testUser);

        // Visit the test channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Revoke all sessions for the user
        cy.externalRequest({user: sysadmin, method: 'post', path: `users/${testUser.id}/sessions/revoke/all`});

        cy.visit('/').wait(TIMEOUTS.HALF_MIN);

        // # Check if user's session is automatically logged out and the user is redirected to the login page
        cy.url().should('contain', '/login');
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
        cy.uiGetLhsSection('DIRECT MESSAGES').findByText(otherUser.username).should('not.be.visible');
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
        cy.uiGetLhsSection('DIRECT MESSAGES').findByText(otherUser.username).should('not.be.visible');

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

    function resetUserEmail(oldEmail, newEmail, errorMsg) {
        cy.visit('/admin_console/user_management/users');

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
            const bodyText = splitEmailBodyText(data.body.text);
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
