// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

<<<<<<< HEAD
// Stage: @prod
// Group: @signin_authentication

describe('SignIn Authentication', () => {
    let testUser;

    before(() => {
        // # Create new user
=======
// Stage: @prod @smoke
// Group: @signin_authentication

import {FixedCloudConfig} from '../../utils/constants';

describe('SignIn Authentification', () => {
    let config;
    let testUser;

    before(() => {
        // Disable other auth options
        const newSettings = {
            Office365Settings: {Enable: false},
            LdapSettings: {Enable: false},
        };
        cy.apiUpdateConfig(newSettings).then((data) => {
            ({config} = data);
        });

        // # Create new team and users
>>>>>>> Add Cypress test for MM-T3080
        cy.apiInitSetup().then(({user}) => {
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
        cy.findByPlaceholderText('Email or Username').clear().type(testUser.email);

        // # Enter any password in the password field
        cy.findByPlaceholderText('Password').clear().type(testUser.password);

        // # Click Sign In to login
        cy.findByText('Sign in').click();

        // * Check that it login successfully and it redirects into the main channel page
        cy.url().should('include', '/channels/town-square');

        // # Click hamburger main menu button
        cy.findByLabelText('main menu').should('exist').and('be.visible').click();

        // # Click on the logout menu
        cy.findByText('Log Out').scrollIntoView().should('exist').and('be.visible').click();

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
>>>>>>> Add Cypress test for MM-T3080
    });
});
