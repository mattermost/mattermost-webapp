// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console @authentication

import * as TIMEOUTS from '../../../fixtures/timeouts';

import {getEmailUrl, reUrl, getRandomId} from '../../../utils';

const authenticator = require('authenticator');

describe('Authentication', () => {
    let mfaSysAdmin;
    let testUser;
    let mentionedUser;
    let adminMFASecret;

    before(() => {
        // # Do email test if setup properly
        cy.apiEmailTest();

        cy.apiInitSetup().then(({user}) => {
            testUser = user;

            cy.apiCreateUser().then(({user: newUser}) => {
                mentionedUser = newUser;
            });
        });

        // # Create and login a newly created user as sysadmin
        cy.apiCreateCustomAdmin().then(({mfaSysAdminCreated}) => {
            mfaSysAdmin = mfaSysAdminCreated;
        });

        // # Log in as a admin.
        cy.apiAdminLogin();
    });

    it('MM-T1764 - Security - Signup: Email verification required (after having created account when verification was not required)', () => {
        // # Update Configs
        cy.apiUpdateConfig({
            TeamSettings: {
                EnableOpenServer: true,
            },
            EmailSettings: {
                RequireEmailVerification: false,
            },
        });

        // # Login as test user and make sure it goes to team selection
        cy.apiLogin(mentionedUser);
        cy.visit('');
        cy.wait(TIMEOUTS.THREE_SEC);
        cy.get('#teamsYouCanJoinContent', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        cy.apiAdminLogin();

        // # Update Configs
        cy.apiUpdateConfig({
            EmailSettings: {
                RequireEmailVerification: true,
            },
        });

        cy.apiLogout();

        // # Login as test user and make sure it goes to team selection
        cy.visit('/login');

        // # Clear email/username field and type username
        cy.get('#loginId', {timeout: TIMEOUTS.ONE_MIN}).clear().type(mentionedUser.username);

        // # Clear password field and type password
        cy.get('#loginPassword').clear().type(mentionedUser.password);

        // # Hit enter to login
        cy.get('#loginButton').click();

        cy.wait(TIMEOUTS.THREE_SEC);

        cy.findByTestId('emailVerifyResend').should('be.visible').click();
        cy.findByTestId('emailVerifySentMessage').should('be.visible');
        cy.findByTestId('emailVerifyAlmost').should('include.text', 'Mattermost: You are almost done');
        cy.findByTestId('emailVerifyNotVerifiedBody').should('include.text', 'Please verify your email address. Check your inbox for an email.');

        const baseUrl = Cypress.config('baseUrl');
        const mailUrl = getEmailUrl(baseUrl);

        cy.task('getRecentEmail', {username: mentionedUser.username, mailUrl}).then((response) => {
            const bodyText = response.data.body.text.split('\n');

            const permalink = bodyText[6].match(reUrl)[0];

            // # Visit permalink (e.g. click on email link), view in browser to proceed
            cy.visit(permalink);

            // # Clear password field
            cy.get('#loginPassword', {timeout: TIMEOUTS.ONE_MIN}).clear().type(mentionedUser.password);

            // # Hit enter to login
            cy.get('#loginButton').click();

            // * Should show the join team stuff
            cy.get('#teamsYouCanJoinContent').should('be.visible');
        });
    });

    it('MM-T1770 - Default password settings', () => {
        cy.apiAdminLogin();

        cy.apiUpdateConfig({
            PasswordSettings: {
                MinimumLength: null,
                Lowercase: null,
                Number: null,
                Uppercase: null,
                Symbol: null,
            },
            ServiceSettings: {
                MaximumLoginAttempts: null,
            },
        });

        // * Ensure password has a minimum lenght of 10, all password requirements are checked, and the maximum login attempts is set to 10
        cy.apiGetConfig().then(({config: {PasswordSettings, ServiceSettings: {MaximumLoginAttempts}}}) => {
            expect(PasswordSettings.MinimumLength).equal(10);
            expect(PasswordSettings.Lowercase).equal(true);
            expect(PasswordSettings.Number).equal(true);
            expect(PasswordSettings.Uppercase).equal(true);
            expect(PasswordSettings.Symbol).equal(true);
            expect(MaximumLoginAttempts).equal(10);
        });
    });

    it('MM-T1778 - MFA - Enforced', () => {
        cy.apiLogin(mfaSysAdmin);

        // # Navigate to System Console -> Authentication -> MFA Page.
        cy.visit('/admin_console/authentication/mfa');
        cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Multi-factor Authentication');

        // # Ensure the setting 'Enable Multi factor authentication' is set to true in the MFA page.
        cy.findByTestId('ServiceSettings.EnableMultifactorAuthenticationtrue').check();

        // # Also ensure that this MFA setting is enforced.
        cy.findByTestId('ServiceSettings.EnforceMultifactorAuthenticationtrue').check();

        // # Click "Save".
        cy.get('#saveSetting').scrollIntoView().click();

        cy.url().then((url) => {
            if (url.includes('mfa/setup')) {
                // # Complete MFA setup if we are on token setup page /mfa/setup
                cy.get('#mfa').wait(TIMEOUTS.HALF_SEC).find('.col-sm-12').then((p) => {
                    const secretp = p.text();
                    adminMFASecret = secretp.split(' ')[1];

                    const token = authenticator.generateToken(adminMFASecret);
                    cy.get('#mfa').find('.form-control').type(token);
                    cy.get('#mfa').find('.btn.btn-primary').click();

                    cy.wait(TIMEOUTS.HALF_SEC);
                    cy.get('#mfa').find('.btn.btn-primary').click();
                });
            } else {
                // # If the sysadmin already has MFA enabled, reset the secret.
                cy.apiGenerateMfaSecret(mfaSysAdmin.id).then((res) => {
                    adminMFASecret = res.code.secret;
                });
            }
        });

        // # Navigate to System Console -> User Management -> Users
        cy.visit('/admin_console/user_management/users');
        cy.get('#searchUsers', {timeout: TIMEOUTS.ONE_MIN}).type(`${testUser.email}`);

        // * Remove MFA option not available for the user
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();
        cy.findByText('Remove MFA').should('not.be.visible');

        // # Login as test user
        cy.apiLogin(testUser);
        cy.visit('/');
        cy.wait(TIMEOUTS.ONE_SEC);
        cy.get('.signup-team__container', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    });

    // This test relies on the previous test for having MFA enabled (MM-T1778)
    it('MM-T1781 - MFA - Admin removes another users MFA', () => {
        // # Login as test user
        cy.apiLogin(testUser);
        cy.visit('');
        cy.wait(TIMEOUTS.ONE_SEC);

        cy.url().then((url) => {
            if (url.includes('mfa/setup')) {
                // # Complete MFA setup if we are on token setup page /mfa/setup
                cy.get('#mfa').wait(TIMEOUTS.HALF_SEC).find('.col-sm-12').then((p) => {
                    const secretp = p.text();
                    const testUserMFASecret = secretp.split(' ')[1];

                    const token = authenticator.generateToken(testUserMFASecret);
                    cy.get('#mfa').find('.form-control').type(token);
                    cy.get('#mfa').find('.btn.btn-primary').click();

                    cy.wait(TIMEOUTS.HALF_SEC);
                    cy.get('#mfa').find('.btn.btn-primary').click();
                });
            }
        });

        // # Login back as admin.
        const token = authenticator.generateToken(adminMFASecret);
        cy.apiLoginWithMFA(mfaSysAdmin, token);

        // # Navigate to System Console -> User Management -> Users
        cy.visit('/admin_console/user_management/users');
        cy.get('#searchUsers', {timeout: TIMEOUTS.ONE_MIN}).type(`${testUser.email}`);

        // * Remove MFA option available for the user and click it
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();
        cy.findByText('Remove MFA').should('be.visible').click();

        // # Navigate to System Console -> Authentication -> MFA Page.
        cy.visit('/admin_console/authentication/mfa');
        cy.get('.admin-console__header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('have.text', 'Multi-factor Authentication');

        // # Also ensure that this MFA setting is enforced.
        cy.findByTestId('ServiceSettings.EnforceMultifactorAuthenticationfalse').check();

        // # Click "Save".
        cy.get('#saveSetting').scrollIntoView().click();

        // # Login as test user
        cy.apiLogin(testUser);
        cy.visit('');
        cy.wait(TIMEOUTS.ONE_SEC);
        cy.get('.signup-team__container').should('not.be.visible');
    });

    // This test relies on the previous test for having MFA enabled (MM-T1781)
    it('MM-T1782 - MFA - Removing MFA option hidden for users without MFA set up', () => {
        // # Login back as admin.
        const token = authenticator.generateToken(adminMFASecret);
        cy.apiLoginWithMFA(mfaSysAdmin, token);

        // # Navigate to System Console -> User Management -> Users
        cy.visit('/admin_console/user_management/users');
        cy.get('#searchUsers', {timeout: TIMEOUTS.ONE_MIN}).type(`${testUser.email}`);

        // * Remove MFA option available for the user and click it
        cy.wait(TIMEOUTS.HALF_SEC);
        cy.findByTestId('userListRow').find('.MenuWrapper a').should('be.visible').click();
        cy.findByText('Remove MFA').should('not.be.visible');

        // # Done with that MFA stuff so we disable it all
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableMultifactorAuthentication: false,
                EnforceMultifactorAuthentication: false,
            },
        });
    });

    it('MM-T1783 - Username validation shows errors for various username requirements', () => {
        cy.apiAdminLogin();

        // # Enable open server
        cy.apiUpdateConfig({
            TeamSettings: {
                EnableOpenServer: true,
            },
        });

        // # Go to sign up with email page
        cy.visit('/signup_email');

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type('Hossein_Is_The_Best_PROGRAMMER@BestInTheWorld.com');

        cy.get('#password').type('Test123456!');

        ['1user', 'te', 'user#1', 'user!1'].forEach((option) => {
            cy.get('#name').clear().type(option);
            cy.get('#createAccountButton').click();

            // * Assert the error is what is expected;
            cy.findByText('Usernames have to begin with a lowercase letter and be 3-22 characters long. You can use lowercase letters, numbers, periods, dashes, and underscores.').should('be.visible');
        });
    });

    it('MM-T1752 - Enable account creation - true', () => {
        cy.apiAdminLogin();

        // # Enable open server
        cy.apiUpdateConfig({
            TeamSettings: {
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
        });

        // # Go to front page
        cy.visit('/login');

        // * Assert that create account ubtton is visible
        cy.get('#signup', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Go to sign up with email page
        cy.visit('/signup_email');

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein_Is_The_Best_PROGRAMMER${getRandomId()}@BestInTheWorld.com`);

        cy.get('#password').type('Test123456!');

        cy.get('#name').clear().type(`HosseinIs2Cool${getRandomId()}`);

        cy.get('#createAccountButton').click();

        // * Make sure account was created successfully and we are on the team joining page
        cy.get('#teamsYouCanJoinContent').should('be.visible');
    });

    it('MM-T1753 - Enable account creation - false', () => {
        cy.apiAdminLogin();

        // # Enable open server and turn off user account creation
        cy.apiUpdateConfig({
            TeamSettings: {
                EnableUserCreation: false,
                EnableOpenServer: true,
            },
        });

        cy.apiLogout();

        // # Go to front page
        cy.visit('/login');

        // * Assert that create account ubtton is visible
        cy.get('#signup', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Go to sign up with email page
        cy.visit('/signup_email');

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein_Is_The_Best_PROGRAMMER${getRandomId()}@BestInTheWorld.com`);

        cy.get('#password').type('Test123456!');

        cy.get('#name').clear().type(`HosseinIs2Cool${getRandomId()}`);

        cy.get('#createAccountButton').click();

        // * Make sure account was not created successfully and we are on the team joining page
        cy.get('#existingEmailErrorContainer').should('have.text', 'User sign-up with email is disabled.');
    });

    it('MM-T1754 - Restrict Domains - Account creation link on signin page', () => {
        cy.apiAdminLogin();

        // # Enable open server and turn off user account creation and set restricted domain
        cy.apiUpdateConfig({
            TeamSettings: {
                RestrictCreationToDomains: 'test.com',
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
        });

        cy.apiLogout();

        // # Go to front page
        cy.visit('/login');

        // * Assert that create account ubtton is visible
        cy.get('#signup', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Go to sign up with email page
        cy.visit('/signup_email');

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein_Is_The_Best_PROGRAMMER${getRandomId()}@BestInTheWorld.com`);

        cy.get('#password').type('Test123456!');

        cy.get('#name').clear().type(`HosseinIs2Cool${getRandomId()}`);

        cy.get('#createAccountButton').click();

        // * Make sure account was not created successfully
        cy.get('#existingEmailErrorContainer').should('have.text', 'The email you provided does not belong to an accepted domain. Please contact your administrator or sign up with a different email.');
    });

    it('MM-T1755 - Restrict Domains - Email invite', () => {
        cy.apiAdminLogin();

        // # Enable open server and turn off user account creation
        cy.apiUpdateConfig({
            TeamSettings: {
                RestrictCreationToDomains: 'test.com',
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
        });

        cy.visit('/');

        // * Verify the side bar is visible
        cy.get('#sidebarHeaderDropdownButton', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Click on the side bar
        cy.get('#sidebarHeaderDropdownButton').click();

        // * Verify Invite People button is visible
        cy.get('#invitePeople').should('be.visible').and('contain', 'Invite People');

        // # Click on the Invite People button
        cy.get('#invitePeople').click();

        // # Click invite members
        cy.findByTestId('invitationModal').click();

        // # Input email, select member
        cy.findByTestId('inputPlaceholder').type('HosseinTheBestProgrammer@Mattermost.com');

        cy.wait(TIMEOUTS.ONE_SEC);

        // # Input email, press enter
        cy.findByTestId('inputPlaceholder').type('{enter}{enter}');

        // # Click invite memebers button
        cy.get('#inviteMembersButton').click();

        // * Verify message is what you expect it to be
        cy.get('.reason').should('include.text', 'The following email addresses do not belong to an accepted domain:');
    });
});
