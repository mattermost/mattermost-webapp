// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

describe('Login page - action specs', () => {
    beforeEach(() => {
        // 1. Go to login page
        cy.visit('/login');
    });

    it('login then logout by user-1', () => {
        // 2. Enter "user-1" on Email or Username input box
        cy.get('#loginId').
            should('be.visible').
            type('user-1');

        // 3. Enter "user-1" on "Password" input box
        cy.get('#loginPassword').
            should('be.visible').
            type('user-1');

        // 4. Click "Sign in" button
        cy.get('#loginButton').click();

        // * Check that the Signin button change with rotating icon and "Signing in..." text
        cy.get('[data-cy="login_signing_in"]').should('be.visible');
        cy.get('#loginButton > :nth-child(1) > :nth-child(2)').should('contain', 'Signing in...');

        // * Check that it login successfully and it redirects into the main channel page
        cy.get('[data-cy="main_channel_page"]').should('be.visible');

        // 5. Click hamburger main menu button
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.get('#logout').
            should('be.visible').
            click();

        // * Check that it logout successfully and it redirects into the login page
        cy.get('[data-cy="login_page"]').should('be.visible');
        cy.location('pathname').should('contain', '/login');
    });
});
