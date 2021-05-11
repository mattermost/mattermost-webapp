// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

<<<<<<< HEAD
<<<<<<< HEAD
// Stage: @prod
// Group: @signin_authentication

describe('SignIn Authentication', () => {
    let testUser;

    before(() => {
        // # Create new user
=======
// Stage: @prod @smoke
=======
>>>>>>> Update e2e/cypress/integration/signin_authentication/login_logout_smoke_spec.js
// Group: @signin_authentication

describe('SignIn Authentication', () => {
    let testUser;

    before(() => {
        // # Create new team and users
<<<<<<< HEAD
>>>>>>> Add Cypress test for MM-T3080
        cy.apiInitSetup().then(({user}) => {
=======
        cy.apiInitSetup().then(({ user }) => {
>>>>>>> Login smoke test codereview fixes
            testUser = user;

            cy.apiLogout();
            cy.visit('/login');
        });
    });

    it('MM-T3080 Sign in email/pwd account', () => {
<<<<<<< HEAD
        // # Enter actual user's email in the email field
        cy.apiGetClientLicense().then(({isLicensed}) => {
            const loginPlaceholder = isLicensed ? 'Email, Username or AD/LDAP Username' : 'Email or Username';
            cy.findByPlaceholderText(loginPlaceholder).clear().type(testUser.email);

            // # Enter user's password in the password field
            cy.findByPlaceholderText('Password').clear().type(testUser.password);

            // # Click Sign In to login
            cy.findByText('Sign in').click();

            // * Check that it login successfully and it redirects into the main channel page
            cy.url().should('include', '/channels/town-square');

            // # Click hamburger main menu button
            cy.findByLabelText('main menu').should('be.visible').click();

            // # Click on the logout menu
            cy.findByText('Log Out').scrollIntoView().should('be.visible').click();

            // * Check that it logout successfully and it redirects into the login page
            cy.url().should('include', '/login');

            // # Enter actual user's username in the email field
            cy.findByPlaceholderText(loginPlaceholder).clear().type(testUser.username);

            // # Enter user's password in the password field
            cy.findByPlaceholderText('Password').clear().type(testUser.password);

            // # Click Sign In to login
            cy.findByText('Sign in').click();

            // * Check that it login successfully and it redirects into the main channel page
            cy.url().should('include', '/channels/town-square');
        });
=======
        // # Enter actual users email in the email field
        cy.apiGetClientLicense().then(({ isLicensed }) => {
            const loginPlaceholder = isLicensed ? 'Email, Username or AD/LDAP Username' : 'Email or Username';
            cy.findByPlaceholderText(loginPlaceholder).clear().type(testUser.email);

            // # Enter any password in the password field
            cy.findByPlaceholderText('Password').clear().type(testUser.password);

            // # Click Sign In to login
            cy.findByText('Sign in').click();

            // * Check that it login successfully and it redirects into the main channel page
            cy.url().should('include', '/channels/town-square');

<<<<<<< HEAD
            // # Click hamburger main menu button
            cy.findByLabelText('main menu').should('exist').and('be.visible').click();

            // # Click on the logout menu
            cy.findByText('Log Out').scrollIntoView().should('exist').and('be.visible').click();
=======
        // # Click hamburger main menu button
        cy.findByLabelText('main menu').should('be.visible').click();

        // # Click on the logout menu
        cy.findByText('Log Out').scrollIntoView().should('be.visible').click();
>>>>>>> Update e2e/cypress/integration/signin_authentication/login_logout_smoke_spec.js

            // * Check that it logout successfully and it redirects into the login page
            cy.url().should('include', '/login');

            // # Enter actual users username in the email field
            cy.findByPlaceholderText('Email or Username').clear().type(testUser.username);

            // # Enter any password in the password field
            cy.findByPlaceholderText('Password').clear().type(testUser.password);

            // # Click Sign In to login
            cy.findByText('Sign in').click();

<<<<<<< HEAD
        // * Check that it login successfully and it redirects into the main channel page
        cy.url().should('include', '/channels/town-square');
>>>>>>> Add Cypress test for MM-T3080
=======
            // * Check that it login successfully and it redirects into the main channel page
            cy.url().should('include', '/channels/town-square');
        });
>>>>>>> Login smoke test codereview fixes
    });
});
