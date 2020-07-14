// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @signin_authentication

let config;

describe('Signup Email page', () => {
    before(() => {
        // Disable other auth options
        const newSettings = {
            Office365Settings: {Enable: false},
            LdapSettings: {Enable: false},
        };
        cy.apiUpdateConfig(newSettings);

        cy.apiGetConfig().then((data) => {
            ({config} = data);
        });
        cy.apiLogout();

        // # Go to signup email page
        cy.visit('/signup_email');
    });

    it('should render', () => {
        // * check the initialUrl
        cy.url().should('include', '/signup_email');

        // * Check that the login section is loaded
        cy.get('#signup_email_section').should('be.visible');

        // * Check the title
        cy.title().should('include', config.TeamSettings.SiteName);
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
        cy.get('#site_name').should('contain', config.TeamSettings.SiteName);
        cy.get('#site_description').should('contain', config.TeamSettings.CustomDescriptionText);
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
        cy.get('#valid_name').should('contain', 'You can use lowercase letters, numbers, periods, dashes, and underscores.');

        cy.get('#password_label').should('contain', 'Choose your password');
        cy.get('#password').should('be.visible');

        cy.get('#createAccountButton').scrollIntoView().should('be.visible');
        cy.get('#createAccountButton').should('contain', 'Create Account');

        cy.get('#signup_agreement').should('contain', `By proceeding to create your account and use ${config.TeamSettings.SiteName}, you agree to our Terms of Service and Privacy Policy. If you do not agree, you cannot use ${config.TeamSettings.SiteName}.`);
        cy.get(`#signup_agreement > span > [href="${config.SupportSettings.TermsOfServiceLink}"]`).should('be.visible');
        cy.get(`#signup_agreement > span > [href="${config.SupportSettings.PrivacyPolicyLink}"]`).should('be.visible');
    });

    it('should match elements, footer', () => {
        // * Check elements in the footer
        cy.get('#footer_section').scrollIntoView().should('be.visible');
        cy.get('#company_name').should('contain', 'Mattermost');
        cy.get('#copyright').should('contain', '© 2015-');
        cy.get('#copyright').should('contain', 'Mattermost, Inc.');
        cy.get('#about_link').should('contain', 'About');
        cy.get('#about_link').should('have.attr', 'href', config.SupportSettings.AboutLink);
        cy.get('#privacy_link').should('contain', 'Privacy');
        cy.get('#privacy_link').should('have.attr', 'href', config.SupportSettings.PrivacyPolicyLink);
        cy.get('#terms_link').should('contain', 'Terms');
        cy.get('#terms_link').should('have.attr', 'href', config.SupportSettings.TermsOfServiceLink);
        cy.get('#help_link').should('contain', 'Help');
        cy.get('#help_link').should('have.attr', 'href', config.SupportSettings.HelpLink);
    });
});
