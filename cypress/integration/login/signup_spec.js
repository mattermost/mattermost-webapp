// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Signup Email page', () => {
    before(() => {
        // 1. Go to signup email page
        cy.visit('/signup_email');
    });

    it('should render', () => {
        // * Check that the login section is loaded
        cy.get('#signup_email_section').should('be.visible');

        // * Check the title
        cy.title().should('include', 'Mattermost');
    });

    it('should match elements, back button', () => {
        // * Check elements in the header with back button
        cy.get('#back_button').should('be.visible');
        cy.get('#back_button').should('contain', 'Back');
        cy.get('#back_button_icon').should('be.visible');
        cy.get('#back_button_icon').should('have.attr', 'title', 'Back Icon');
    });

    it('should match elements, body', () => {
        // * Check elements in the body
        cy.get('#signup_email_section').should('be.visible');
        cy.get('#site_name').should('contain', 'Mattermost');
        cy.get('#site_description').should('contain', 'All team communication in one place, searchable and accessible anywhere');
        cy.get('#create_account').should('contain', 'Let\'s create your account');
        cy.get('#signin_account').should('contain', 'Already have an account?');
        cy.get('#signin_account').should('contain', 'Click here to sign in.');
        cy.get('#signin_account_link').should('contain', 'Click here to sign in.');
        cy.get('#signin_account_link').should('have.attr', 'href', '/login');

        cy.get('#email_label').should('contain', 'What\'s your email address?');
        cy.get('#email').should('be.visible');
        cy.focused().should('have.attr', 'id', 'email');
        cy.get('#valid_email').should('contain', 'Valid email required for sign-up');

        cy.get('#name_label').should('contain', 'Choose your username');
        cy.get('#name').should('be.visible');
        cy.get('#valid_name').should('contain', 'Username must begin with a letter, and contain between 3 to 22 lowercase characters made up of numbers, letters, and the symbols \'.\', \'-\' and \'_\'');

        cy.get('#password_label').should('contain', 'Choose your password');
        cy.get('#password').should('be.visible');

        cy.get('#createAccountButton').should('be.visible');
        cy.get('#createAccountButton').should('contain', 'Create Account');

        cy.get('#signup_agreement').should('contain', 'By proceeding to create your account and use Mattermost, you agree to our Terms of Service and Privacy Policy. If you do not agree, you cannot use Mattermost.');
        cy.get('#signup_agreement > span > [href="https://about.mattermost.com/default-terms/"]').should('be.visible');
        cy.get('#signup_agreement > span > [href="https://about.mattermost.com/default-privacy-policy/"]').should('be.visible');
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
});
