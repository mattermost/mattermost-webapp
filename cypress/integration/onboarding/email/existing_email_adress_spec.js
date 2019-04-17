// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Email Address', () => {
    before(() => {
        // 1. Go to / and logout
        cy.visit('/');
        cy.apiLogout();
    });

    it('M16363 Should not create account with an existing email address', () => {
    // Create a new user
        // 2. Go to /login
        cy.visit('/login');

        // 3. Click on sign up button
        cy.get('#signup').click();

        // 4. Type 'unique.email@sample.mattermost.com' for email
        cy.get('#email').type('unique.email@sample.mattermost.com');

        // 5. Type 'unique-1' for username
        cy.get('#name').type('unique-1');

        // 6. Type 'unique1pw' for password
        cy.get('#password').type('unique1pw');

        // 7. Click on Create Account button
        cy.get('#createAccountButton').click();

        // * Verify there is Logout Button
        cy.contains('Logout').should('be.visible');

        // * Verify 'Teams you can join' is visible
        cy.contains('Teams you can join').should('be.visible');

        // * Verify the link to create a new team is available
        cy.get('a.signup-team-login').should('have.attr', 'href', '/create_team').and('be.visible', 'contain', 'Create a new team');

        // Create another user with the same email but different username and password:
        // 8. cy.apiLogout()
        cy.apiLogout();

        // 9. Go to /login
        cy.visit('/login');

        // 10. Click on sign up button
        cy.get('#signup').click();

        // 11. Type 'unique.email@sample.mattermost.com' for email
        cy.get('#email').type('unique.email@sample.mattermost.com');

        // 12. Type 'unique-2' for username
        cy.get('#name').type('unique-2');

        // 13. Type 'unique2pw' for password
        cy.get('#password').type('unique2pw');

        // 14. Click on Create Account button
        cy.get('#createAccountButton').click();

        // * Error message displays below the Create Account button that says "An account with that email already exists"
        cy.get('div.form-group.has-error').should('contain', 'An account with that email already exists');
    });
});
