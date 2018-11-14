// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

describe('Login page - element specs', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    it('should render', () => {
        cy.get('[data-cy="login_page"]').should('be.visible');

        cy.title().should('include', 'Mattermost');
    });

    it('get login body', () => {
        cy.get('.signup-team__container').should('be.visible');
        cy.get('h1').should('contain', 'Mattermost');
        cy.get('.color--light > span').should('contain', 'All team communication in one place, searchable and accessible anywhere');
        cy.get('#loginId').should('be.visible');
        cy.get('#loginId').should('have.attr', 'placeholder', 'Email or Username');
        cy.get('#loginPassword').should('be.visible');
        cy.get('#loginPassword').should('have.attr', 'placeholder', 'Password');
        cy.get('#loginButton').should('be.visible');
        cy.get('#loginButton > span').should('contain', 'Sign in');
        cy.get(':nth-child(3) > :nth-child(2) > a > span').should('contain', 'I forgot my password');
    });

    it('get login footer', () => {
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
