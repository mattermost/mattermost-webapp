// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomInt} from '../../../utils';

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const uniqueUserId = getRandomInt(99999);

function signupWithEmail(name, pw) {
    // 1. Go to /login
    cy.visit('/login');

    // 2. Click on sign up button
    cy.get('#signup').click();

    // 3. Type email address (by adding the uniqueUserId in the email address)
    cy.get('#email').type('unique.' + uniqueUserId + '@sample.mattermost.com');

    // 4. Type 'unique-1' for username
    cy.get('#name').type(name);

    // 5. Type 'unique1pw' for password
    cy.get('#password').type(pw);

    // 6. Click on Create Account button
    cy.get('#createAccountButton').click();
}

describe('Email Address', () => {
    before(() => {
        // Before test, login as sysadmin, set Enable Open Server to true then logout
        cy.apiLogin('sysadmin');
        cy.apiEnableOpenServer(true);
        cy.apiLogout();
    });

    after(() => {
        // Revert Enable Open Server in Team Settings config to false after test
        cy.apiLogin('sysadmin');
        cy.apiEnableOpenServer(false);
    });

    it('M14634 Should not create account with an existing email address', () => {
        // 7. Signup a new user with an email address and user generated in signupWithEmail
        signupWithEmail('unique.' + uniqueUserId, 'unique1pw');

        // * Verify there is Logout Button
        cy.contains('Logout').should('be.visible');

        // * Verify 'Teams you can join' is visible
        cy.get('#teamsYouCanJoinContent').should('be.visible');

        // * Verify the link to create a new team is available
        cy.get('#createNewTeamLink').should('have.attr', 'href', '/create_team').and('be.visible', 'contain', 'Create a new team');

        // 8. Logout and signup another user with the same email but different username and password
        cy.apiLogout();
        signupWithEmail('unique-2', 'unique2pw');

        // * Error message displays below the Create Account button that says "An account with that email already exists"
        cy.get('#existingEmailErrorContainer').should('contain', 'An account with that email already exists');
    });
});
