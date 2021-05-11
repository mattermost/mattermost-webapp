// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @signin_authentication

describe('SignIn Authentication', () => {
    let testUser;

    before(() => {
        // # Create new team and users
        cy.apiInitSetup().then(({user}) => {
            testUser = user;

            cy.apiLogout();
            cy.visit('/login');
        });
    });

    it('MM-T3080 Sign in email/pwd account', () => {
        // # Enter actual users email in the email field
        cy.findByPlaceholderText('Email or Username').clear().type(testUser.email);

        // # Enter any password in the password field
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

        // # Enter actual users username in the email field
        cy.findByPlaceholderText('Email or Username').clear().type(testUser.username);

        // # Enter any password in the password field
        cy.findByPlaceholderText('Password').clear().type(testUser.password);

        // # Click Sign In to login
        cy.findByText('Sign in').click();

        // * Check that it login successfully and it redirects into the main channel page
        cy.url().should('include', '/channels/town-square');
    });
});
