// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import users from '../../fixtures/users.json';

let config;

describe('Login page', () => {
    before(() => {
        // Disable other auth options
        const newSettings = {
            Office365Settings: {Enable: false},
            LdapSettings: {Enable: false},
        };
        cy.apiUpdateConfig(newSettings);

        cy.apiGetConfig().then((response) => {
            config = response.body;
        });

        // # Go to login page
        cy.apiLogout();

        cy.visit('/login');
    });

    it('should render', () => {
        // * Check that the login section is loaded
        cy.get('#login_section').should('be.visible');

        // * Check the title
        cy.title().should('include', config.TeamSettings.SiteName);
    });

    it('should match elements, body', () => {
        // * Check elements in the body
        cy.get('#login_section').should('be.visible');
        cy.get('#site_name').should('contain', config.TeamSettings.SiteName);
        cy.get('#site_description').should('contain', 'All team communication in one place, searchable and accessible anywhere');
        cy.get('#loginId').
            should('be.visible').
            and(($loginTextbox) => {
                const placeholder = $loginTextbox[0].placeholder;
                expect(placeholder).to.match(/Email/);
                expect(placeholder).to.match(/Username/);
            });
        cy.get('#loginPassword').
            should('be.visible').
            and('have.attr', 'placeholder', 'Password');
        cy.get('#loginButton').
            should('be.visible').
            and('contain', 'Sign in');
        cy.get('#login_forgot').should('contain', 'I forgot my password');
    });

    it('should match elements, footer', () => {
        // * Check elements in the footer
        cy.get('#footer_section').should('be.visible');
        cy.get('#company_name').should('contain', 'Mattermost');
        cy.get('#copyright').
            should('contain', '© 2015-').
            and('contain', 'Mattermost, Inc.');
        cy.get('#about_link').
            should('contain', 'About').
            and('have.attr', 'href', config.SupportSettings.AboutLink);
        cy.get('#privacy_link').
            should('contain', 'Privacy').
            and('have.attr', 'href', config.SupportSettings.PrivacyPolicyLink);
        cy.get('#terms_link').
            should('contain', 'Terms').
            and('have.attr', 'href', config.SupportSettings.TermsOfServiceLink);
        cy.get('#help_link').
            should('contain', 'Help').
            and('have.attr', 'href', config.SupportSettings.HelpLink);
    });

    it('should login then logout by user-1', () => {
        const user = users['user-1'];

        // # Enter "user-1" on Email or Username input box
        cy.get('#loginId').should('be.visible').type(user.username);

        // # Enter "user-1" on "Password" input box
        cy.get('#loginPassword').should('be.visible').type(user.password);

        // # Click "Sign in" button
        cy.get('#loginButton').should('be.visible').click();

        // * Check that the Signin button change with rotating icon and "Signing in..." text
        cy.get('#loadingSpinner').
            should('be.visible').
            and('contain', 'Signing in...');

        // * Check that it login successfully and it redirects into the main channel page
        cy.get('#channel_view').should('be.visible');

        // # Click hamburger main menu button
        cy.get('#sidebarHeaderDropdownButton').click();
        cy.get('#logout').should('be.visible').click();

        // * Check that it logout successfully and it redirects into the login page
        cy.get('#login_section').should('be.visible');
        cy.location('pathname').should('contain', '/login');
    });
});
