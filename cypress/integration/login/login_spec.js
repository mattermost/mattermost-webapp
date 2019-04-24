// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Login page', () => {
    before(() => {
        cy.apiLogout();

        // 1. Go to login page
        cy.visit('/login');
    });

    it('should render', () => {
        // * Check that the login section is loaded
        cy.get('#login_section').should('be.visible');

        // * Check the title
        cy.title().should('include', 'Mattermost');
    });

    it('should match elements, body', () => {
        // * Check elements in the body
        cy.get('#login_section').should('be.visible');
        cy.get('#site_name').should('contain', 'Mattermost');
        cy.get('#site_description').should('contain', 'All team communication in one place, searchable and accessible anywhere');
        cy.get('#loginId').should('be.visible');
        cy.get('#loginId').should('have.attr', 'placeholder', 'Email or Username');
        cy.get('#loginPassword').should('be.visible');
        cy.get('#loginPassword').should('have.attr', 'placeholder', 'Password');
        cy.get('#loginButton').should('be.visible');
        cy.get('#loginButton').should('contain', 'Sign in');
        cy.get('#login_forgot').should('contain', 'I forgot my password');
    });

    it('should match elements, footer', () => {
        // * Check elements in the footer
        cy.get('#footer_section').should('be.visible');
        cy.get('#company_name').should('contain', 'Mattermost');
        cy.get('#copyright').should('contain', '© 2015-');
        cy.get('#copyright').should('contain', 'Mattermost, Inc.');
        cy.get('#about_link').should('contain', 'About');
        cy.get('#about_link').should('have.attr', 'href', 'https://about.mattermost.com/default-about/');
        cy.get('#privacy_link').should('contain', 'Privacy');
        cy.get('#privacy_link').should('have.attr', 'href', 'https://about.mattermost.com/default-privacy-policy/');
        cy.get('#terms_link').should('contain', 'Terms');
        cy.get('#terms_link').should('have.attr', 'href', 'https://about.mattermost.com/default-terms/');
        cy.get('#help_link').should('contain', 'Help');
        cy.get('#help_link').should('have.attr', 'href', 'https://about.mattermost.com/default-help/');
    });

    it('should login then logout by user-1', () => {
        // 2. Enter "user-1" on Email or Username input box
        cy.get('#loginId').should('be.visible').type('user-1');

        // 3. Enter "user-1" on "Password" input box
        cy.get('#loginPassword').should('be.visible').type('user-1');

        // 4. Click "Sign in" button
        cy.get('#loginButton').should('be.visible').click();

        // * Check that the Signin button change with rotating icon and "Signing in..." text
        cy.get('#loadingSpinner').should('be.visible');
        cy.get('#loadingSpinner').should('contain', 'Signing in...');

        // * Check that it login successfully and it redirects into the main channel page
        cy.get('#channel_view').should('be.visible');

        // 5. Click hamburger main menu button
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#logout').should('be.visible').click();

        // * Check that it logout successfully and it redirects into the login page
        cy.get('#login_section').should('be.visible');
        cy.location('pathname').should('contain', '/login');
    });
});
