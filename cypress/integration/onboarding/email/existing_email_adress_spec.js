// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

function signup(email, name, pw) {
    // 2. Go to /login
    cy.visit('/login');

    // 3. Click on sign up button
    cy.get('#signup').click();

    // 4. Type 'unique.email@sample.mattermost.com' for email
    cy.get('#email').type(email);

    // 5. Type 'unique-1' for username
    cy.get('#name').type(name);

    // 6. Type 'unique1pw' for password
    cy.get('#password').type(pw);

    // 7. Click on Create Account button
    cy.get('#createAccountButton').click();
}

describe('Email Address', () => {
    before(() => {
        // 1. Go to / and logout
        cy.visit('/');
        cy.apiLogout();
    });

    it('M16363 Should not create account with an existing email address', () => {
        signup('unique.email@sample.mattermost.com', 'unique-1', 'unique1pw');

        // * Verify there is Logout Button
        cy.contains('Logout').should('be.visible');

        // * Verify 'Teams you can join' is visible
        cy.get('#teamsYouCanJoinContent').should('be.visible');

        // * Verify the link to create a new team is available
        cy.get('#createNewTeamLink').should('have.attr', 'href', '/create_team').and('be.visible', 'contain', 'Create a new team');

        // Create another user with the same email but different username and password:
        // 8. cy.apiLogout()
        cy.apiLogout();

        signup('unique.email@sample.mattermost.com', 'unique-2', 'unique2pw');

        // * Error message displays below the Create Account button that says "An account with that email already exists"
        cy.get('#existingEmailErrorContainer').should('contain', 'An account with that email already exists');
    });
});
