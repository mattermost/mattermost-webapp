// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @not_cloud @system_console

import {isMac, isWindows} from '../../../utils';

import {backToTeam, saveSetting} from './helper';

describe('SupportSettings', () => {
    const tosLink = 'https://github.com/mattermost/platform/blob/master/README.md';
    const privacyLink = 'https://github.com/mattermost/platform/blob/master/README.md';
    const defaultTOSLink = 'https://about.mattermost.com/default-terms/';
    const defaultPrivacyLink = 'https://about.mattermost.com/default-privacy-policy/';

    let testTeam;
    let siteName;

    before(() => {
        cy.shouldNotRunOnCloudEdition();

        cy.apiGetConfig().then(({config}) => {
            siteName = config.TeamSettings.SiteName;
        });

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
        });
    });

    beforeEach(() => {
        cy.apiAdminLogin();
        cy.apiUpdateConfig();

        // # Visit customization system console page
        cy.visit('/admin_console/site_config/customization');
    });

    it('MM-T1032 - Customization: Custom Terms and Privacy links in the About modal', () => {
        // # Edit links in the TOS and Privacy fields
        cy.findByTestId('SupportSettings.TermsOfServiceLinkinput').clear().type(tosLink);
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkinput').clear().type(privacyLink);

        // # Save setting then back to team view
        saveSetting();
        backToTeam();

        // # Open about modal
        cy.uiOpenProductMenu(`About ${siteName}`);

        // * Verify that links do not change and they open to default pages
        cy.get('#tosLink').should('contain', 'Terms of Service').and('have.attr', 'href').and('equal', defaultTOSLink);
        cy.get('#privacyLink').should('contain', 'Privacy Policy').and('have.attr', 'href').and('equal', defaultPrivacyLink);
    });

    it('MM-T1034 - Customization: Blank TOS link field (About modal)', () => {
        // # Empty the "terms of services" field
        cy.findByTestId('SupportSettings.TermsOfServiceLinkinput').type('any').clear();

        // # Save setting then back to team view
        saveSetting();
        backToTeam();

        // # Open about modal
        cy.uiOpenProductMenu(`About ${siteName}`);

        // * Verify that tos link is set to default
        cy.get('#tosLink').should('contain', 'Terms of Service').and('have.attr', 'href').and('equal', defaultTOSLink);
    });

    it('MM-T1035 - Customization Blank Privacy hides the link', () => {
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkinput').clear();

        // # Save setting then back to team view
        saveSetting();
        backToTeam();

        // # Open about modal
        cy.uiOpenProductMenu(`About ${siteName}`);

        // * Verify that tos link is there
        cy.get('#tosLink').should('be.visible').and('contain', 'Terms of Service');

        // * Verify that privacy link is there
        cy.get('#privacyLink').should('contain', 'Privacy Policy').and('have.attr', 'href').and('equal', defaultPrivacyLink);

        // # Logout
        cy.apiLogout();

        // * Verify that the user was redirected to the login page after the logout
        cy.url().should('include', '/login');

        // * Verify no privacy link
        cy.get('#privacy_link').should('not.exist');

        // # Visit signup page
        cy.get('#signup').click();

        // * Verify no privacy link
        cy.get('#privacy_link').should('not.exist');
    });

    it('MM-T1039 - Customization App download link - Remove', () => {
        cy.apiUpdateConfig({
            ServiceSettings: {EnableOnboardingFlow: true},
        });
        cy.reload();

        // # Edit links in the support email field
        cy.findByTestId('NativeAppSettings.AppDownloadLinkinput').type('any').clear();

        // # Save setting then back to team view
        saveSetting();
        backToTeam();

        // # Open about modal
        cy.uiOpenProductMenu().within(() => {
            // * Verify that 'Download Apps' does not exist
            cy.findByText('Download Apps').should('not.exist');
        });

        // # Create new user to run tutorial
        cy.apiCreateUser({
            bypassTutorial: false,
            hideOnboarding: false,
        }).then(({user: user1}) => {
            cy.apiAddUserToTeam(testTeam.id, user1.id);

            // # Logout then login as new user
            cy.uiLogout();
            cy.uiLogin(user1);

            // * Verify that onboarding page is shown
            cy.findByText(`Welcome to ${siteName}`);

            cy.findAllByText('Download the Desktop and Mobile apps');
            cy.findAllByText('See all the apps');

            let suffix = '';
            if (isMac()) {
                suffix = ' for Mac';
            } else if (isWindows()) {
                suffix = ' for Windows';
            }
            cy.findAllByText(`Get Mattermost${suffix}`);
        });
    });
});
