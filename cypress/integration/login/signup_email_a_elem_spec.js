// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="Cypress" />

describe('Signup Email page', () => {
    beforeEach(() => {
        cy.visit('/signup_email');
    });

    it('should render', () => {
        cy.get('[data-cy="signup_email_page"]').should('be.visible');

        cy.title().should('include', 'Mattermost');
    });

    it('get signup email header', () => {
        cy.get('.signup-header').should('be.visible');
        cy.get('.fa-chevron-left').should('be.visible');
        cy.get('.fa-chevron-left').should('have.attr', 'title', 'Back Icon');
        cy.get('a > :nth-child(2)').should('be.visible');
        cy.get('a > :nth-child(2)').should('contain', 'Back');
    });

    it('get signup email body', () => {
        cy.get('.signup-team__container').should('be.visible');
        cy.get('h1').should('contain', 'Mattermost');
        cy.get('.color--light > span').should('contain', 'All team communication in one place, searchable and accessible anywhere');
        cy.get('.signup-team__container > :nth-child(4) > span').should('contain', 'Let\'s create your account');
        cy.get('span.color--light > :nth-child(1)').should('contain', 'Already have an account?');
        cy.get('span.color--light > a > span').should('contain', 'Click here to sign in.');
        cy.get('span.color--light > a').should('have.attr', 'href', '/login');

        cy.get(':nth-child(1) > h5 > strong > span').should('contain', 'What\'s your email address?');
        cy.get('#email').should('be.visible');
        cy.focused().should('have.attr', 'id', 'email');
        cy.get(':nth-child(1) > .form-group > .help-block > span').should('contain', 'Valid email required for sign-up');

        cy.get(':nth-child(2) > h5 > strong > span').should('contain', 'Choose your username');
        cy.get('#name').should('be.visible');
        cy.get(':nth-child(2) > .form-group > .help-block > span').should('contain', 'Username must begin with a letter, and contain between 3 to 22 lowercase characters made up of numbers, letters, and the symbols \'.\', \'-\' and \'_\'');

        cy.get(':nth-child(3) > h5 > strong > span').should('contain', 'Choose your password');
        cy.get('#password').should('be.visible');

        cy.get('#createAccountButton').should('be.visible');
        cy.get('#createAccountButton > span').should('contain', 'Create Account');

        cy.get(':nth-child(7) > span').should('contain', 'By proceeding to create your account and use Mattermost, you agree to our Terms of Service and Privacy Policy. If you do not agree, you cannot use Mattermost.');
        cy.get(':nth-child(7) > span > [href="https://about.mattermost.com/default-terms/"]').should('be.visible');
        cy.get(':nth-child(7) > span > [href="https://about.mattermost.com/default-privacy-policy/"]').should('be.visible');
    });

    it('get signup email footer', () => {
        cy.get('.footer-pane').should('be.visible');
        cy.get(':nth-child(1) > .pull-right').should('contain', 'Mattermost');
        cy.get('#about_link > span').should('contain', 'About');
        cy.get('#about_link').should('have.attr', 'href', 'https://about.mattermost.com/default-about/');
        cy.get('#privacy_link > span').should('contain', 'Privacy');
        cy.get('#privacy_link').should('have.attr', 'href', 'https://about.mattermost.com/default-privacy-policy/');
        cy.get('#terms_link > span').should('contain', 'Terms');
        cy.get('#terms_link').should('have.attr', 'href', 'https://about.mattermost.com/default-terms/');
        cy.get('#help_link > span').should('contain', 'Help');
        cy.get('#help_link').should('have.attr', 'href', 'https://about.mattermost.com/default-help/');
    });
});
