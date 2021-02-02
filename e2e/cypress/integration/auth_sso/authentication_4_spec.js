// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console @authentication

import * as TIMEOUTS from '../../fixtures/timeouts';

import {getEmailUrl, reUrl, getRandomId} from '../../utils';

describe('Authentication', () => {
    let testUser;

    before(() => {
        // # Do email test if setup properly
        cy.apiEmailTest();

        cy.apiCreateUser().then(({user: newUser}) => {
            testUser = newUser;
        });
    });

    beforeEach(() => {
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
        cy.apiLogin(testUser);
        cy.visit('/');
        cy.url().should('include', '/select_team');
        cy.findByText('Teams you can join:', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

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
        cy.apiGetClientLicense().then(({isLicensed}) => {
            cy.findByPlaceholderText(isLicensed ? 'Email, Username or AD/LDAP Username' : 'Email or Username', {timeout: TIMEOUTS.ONE_MIN}).clear().type(testUser.username);
        });

        // # Clear password field and type password
        cy.findByPlaceholderText('Password').clear().type(testUser.password);

        // # Hit enter to login
        cy.findByText('Sign in').click();

        cy.wait(TIMEOUTS.THREE_SEC);

        // * Assert that email verification has been sent and then resend to make sure it gets resent
        cy.findByText('Resend Email').should('be.visible').and('exist').click();
        cy.findByText('Verification email sent.').should('be.visible').and('exist');
        cy.findByText('Mattermost: You are almost done').should('be.visible').and('exist');
        cy.findByText('Please verify your email address. Check your inbox for an email.').should('be.visible').and('exist');

        const baseUrl = Cypress.config('baseUrl');
        const mailUrl = getEmailUrl(baseUrl);

        cy.task('getRecentEmail', {username: testUser.username, mailUrl}).then((response) => {
            const bodyText = response.data.body.text.split('\n');

            const permalink = bodyText[6].match(reUrl)[0];

            // # Visit permalink (e.g. click on email link), view in browser to proceed
            cy.visit(permalink);

            // # Clear password field and type password
            cy.findByPlaceholderText('Password').clear().type(testUser.password);

            // # Hit enter to login
            cy.findByText('Sign in').click();

            // * Should show the join team stuff
            cy.findByText('Teams you can join:', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
        });
    });

    it('MM-T1770 - Default password settings', () => {
        cy.apiGetClientLicense().then(({isCloudLicensed}) => {
            const newConfig = {
                PasswordSettings: {
                    MinimumLength: null,
                    Lowercase: null,
                    Number: null,
                    Uppercase: null,
                    Symbol: null,
                },
            };

            if (!isCloudLicensed) {
                newConfig.ServiceSettings = {
                    MaximumLoginAttempts: null,
                };
            }

            cy.apiUpdateConfig(newConfig);

            // * Ensure password has a minimum length of 10 and all password requirements are checked
            cy.apiGetConfig().then(({config: {PasswordSettings}}) => {
                expect(PasswordSettings.MinimumLength).equal(10);
                expect(PasswordSettings.Lowercase).equal(true);
                expect(PasswordSettings.Number).equal(true);
                expect(PasswordSettings.Uppercase).equal(true);
                expect(PasswordSettings.Symbol).equal(true);
            });

            cy.visit('/admin_console/authentication/password');
            cy.get('.admin-console__header').should('be.visible').and('have.text', 'Password');

            cy.findByTestId('passwordMinimumLengthinput').should('be.visible').and('have.value', '10');
            cy.findByRole('checkbox', {name: 'At least one lowercase letter'}).should('be.checked');
            cy.findByRole('checkbox', {name: 'At least one uppercase letter'}).should('be.checked');
            cy.findByRole('checkbox', {name: 'At least one number'}).should('be.checked');
            cy.findByRole('checkbox', {name: 'At least one symbol (e.g. "~!@#$%^&*()")'}).should('be.checked');

            cy.findByTestId('maximumLoginAttemptsinput').should('be.visible').and('have.value', isCloudLicensed ? '' : '10');
        });
    });

    it('MM-T1783 - Username validation shows errors for various username requirements', () => {
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
            cy.findByText('Create Account').click();

            // * Assert the error is what is expected;
            cy.findByText('Usernames have to begin with a lowercase letter and be 3-22 characters long. You can use lowercase letters, numbers, periods, dashes, and underscores.').should('be.visible');
        });
    });

    it('MM-T1752 - Enable account creation - true', () => {
        // # Enable open server
        cy.apiUpdateConfig({
            TeamSettings: {
                EnableUserCreation: true,
                EnableOpenServer: true,
            },
        });

        // # Logout and go to front page
        cy.apiLogout();
        cy.visit('/login');

        // * Assert that create account button is visible
        cy.findByText('Create one now.', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Go to sign up with email page
        cy.visit('/signup_email');

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein_Is_The_Best_PROGRAMMER${getRandomId()}@BestInTheWorld.com`);

        cy.get('#password').type('Test123456!');

        cy.get('#name').clear().type(`HosseinIs2Cool${getRandomId()}`);

        cy.findByText('Create Account').click();

        // * Make sure account was created successfully and we are on the team joining page
        cy.findByText('Teams you can join:', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');
    });

    it('MM-T1753 - Enable account creation - false', () => {
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

        // * Assert that create account button is visible
        cy.findByText('Create one now.', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Go to sign up with email page
        cy.visit('/signup_email');

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein_Is_The_Best_PROGRAMMER${getRandomId()}@BestInTheWorld.com`);

        cy.get('#password').type('Test123456!');

        cy.get('#name').clear().type(`HosseinIs2Cool${getRandomId()}`);

        cy.findByText('Create Account').click();

        // * Make sure account was not created successfully and we are on the team joining page
        cy.findByText('User sign-up with email is disabled.').should('be.visible').and('exist');
    });

    it('MM-T1754 - Restrict Domains - Account creation link on signin page', () => {
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

        // * Assert that create account button is visible
        cy.findByText('Create one now.', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible');

        // # Go to sign up with email page
        cy.visit('/signup_email');

        cy.get('#email', {timeout: TIMEOUTS.ONE_MIN}).type(`Hossein_Is_The_Best_PROGRAMMER${getRandomId()}@BestInTheWorld.com`);

        cy.get('#password').type('Test123456!');

        cy.get('#name').clear().type(`HosseinIs2Cool${getRandomId()}`);

        cy.findByText('Create Account').click();

        // * Make sure account was not created successfully
        cy.findByText('The email you provided does not belong to an accepted domain. Please contact your administrator or sign up with a different email.').should('be.visible').and('exist');
    });

    it('MM-T1755 - Restrict Domains - Email invite', () => {
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

        // * Verify Invite People button is visible and exist and then click it
        cy.findByText('Invite People').should('be.visible').and('exist').click();

        // # Click invite members
        cy.findByText('Members').click();

        // # Input email, select member
        cy.findByText('Add members or email addresses').type('HosseinTheBestProgrammer@Mattermost.com{enter}{enter}');

        // # Click invite members button
        cy.findByText('Invite Members').click();

        // * Verify message is what you expect it to be
        cy.contains('The following email addresses do not belong to an accepted domain:', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').and('exist');
    });
});
