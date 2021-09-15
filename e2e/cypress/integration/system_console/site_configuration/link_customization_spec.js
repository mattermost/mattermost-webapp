// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console

import {backToTeam, saveSetting} from './helper';

describe('SupportSettings', () => {
    const tosLink = 'https://github.com/mattermost/platform/blob/master/README.md';
    const privacyLink = 'https://github.com/mattermost/platform/blob/master/README.md';
    const aboutLink = 'http://www.mattermost.org/features/';
    const helpLink = 'https://github.com/mattermost/platform/blob/master/doc/help/README.md';
    const problemLink = 'https://forum.mattermost.org/c/general/trouble-shoot';
    const defaultTosLink = 'https://mattermost.com/terms-of-service/';

    beforeEach(() => {
        // # Login as admin and reset config
        cy.apiAdminLogin();
        cy.apiUpdateConfig();

        // # Visit customization system console page
        cy.visit('/admin_console/site_config/customization');
    });

    it('MM-T1031 - Customization Change all links', () => {
        // # Edit links in the TOS, Privacy, About, Help, Report fields
        cy.findByTestId('SupportSettings.TermsOfServiceLinkinput').clear().type(tosLink);
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkinput').clear().type(privacyLink);
        cy.findByTestId('SupportSettings.AboutLinkinput').clear().type(aboutLink);
        cy.findByTestId('SupportSettings.HelpLinkinput').clear().type(helpLink);
        cy.findByTestId('SupportSettings.ReportAProblemLinkinput').clear().type(problemLink);

        // # Save setting then back to team view
        saveSetting();
        backToTeam();

        // # Open about modal
        cy.uiOpenHelpMenu().within(() => {
            // * Verify links changed
            [
                {text: 'Report a problem', link: problemLink},
                {text: 'Help resources', link: helpLink},
            ].forEach((guide) => {
                cy.findByText(guide.text).
                    parent().
                    should('have.attr', 'href', guide.link);
            });
        });

        // # Logout
        cy.uiLogout();

        // * Verify that the user was redirected to the login page after the logout
        cy.url().should('include', '/login');

        const guides = [
            {text: 'About', link: aboutLink},
            {text: 'Privacy', link: privacyLink},
            {text: 'Terms', link: tosLink},
            {text: 'Help', link: helpLink},
        ];

        // * Verify that links are correct at login page
        guides.forEach((guide) => {
            cy.findByText(guide.text).
                parent().
                should('have.attr', 'href', guide.link);
        });

        // # Visit signup page
        cy.get('#signup').click();
        cy.url().should('include', '/signup_user_complete');

        // * Verify that links are correct at signup page
        guides.forEach((guide) => {
            cy.findByText(guide.text).
                parent().
                should('have.attr', 'href', guide.link);
        });
    });

    it('MM-T1033 - Customization: Blank TOS link field (login page)', () => {
        // # Empty the "terms of services" field
        cy.findByTestId('SupportSettings.TermsOfServiceLinkinput').type('any').clear();

        // # Save setting
        saveSetting();

        // # Logout
        cy.apiLogout();

        // * Verify that the user was redirected to the login page after the logout
        cy.url().should('include', '/login');

        // * Verify that terms of services link is set to default
        cy.findByText('Terms').
            parent().
            should('have.attr', 'href', defaultTosLink);
    });

    it('MM-T1036 - Customization: Blank Help and Report a Problem hides options from main menu', () => {
        // # Change help and report links to blanks
        cy.findByTestId('SupportSettings.HelpLinkinput').type('any').clear();
        cy.findByTestId('SupportSettings.ReportAProblemLinkinput').type('any').clear();

        // # Save setting and back to team view
        saveSetting();
        backToTeam();

        // * Verify that report link does not exist
        cy.uiOpenHelpMenu().within(() => {
            cy.get('Report a problem').should('not.exist');
            cy.get('Help resources').should('not.exist');
        });
    });

    it('MM-T1038 - Customization App download link - Change to different', () => {
        // # Edit links in the support email field
        const link = 'some_link';
        cy.findByTestId('NativeAppSettings.AppDownloadLinkinput').clear().type(link);

        // # Save setting then back to team view
        saveSetting();
        backToTeam();

        // # Open about modal
        cy.uiOpenProductSwitchMenu().within(() => {
            // * Verify that 'Download Apps' has expected link
            cy.findByText('Download Apps').
                parent().
                should('have.attr', 'href', link);
        });
    });

    it('MM-T3289_1 - Help (Ask community link setting)', () => {
        // * Verify enable ask community link to be true by default
        cy.findByTestId('SupportSettings.EnableAskCommunityLinktrue').should('be.checked');

        // * Verify the help text
        cy.findByTestId('SupportSettings.EnableAskCommunityLinkhelp-text').should('contain', 'When true, "Ask the community" link appears on the Mattermost user interface and Main Menu, which allows users to join the Mattermost Community to ask questions and help others troubleshoot issues. When false, the link is hidden from users.');

        // # Back to team view
        backToTeam();

        // * Verify that hover shows "Help" text
        cy.uiGetHelpButton().
            trigger('mouseover', {force: true}).
            should('have.attr', 'aria-describedby').
            and('equal', 'userGuideHelpTooltip');
        cy.uiGetHelpButton().
            trigger('mouseout', {force: true}).
            should('not.have.attr', 'aria-describedby');

        // # Open help menu
        cy.uiOpenHelpMenu().within(() => {
            // * Verify 5 options shown
            cy.findByText('Ask the community');
            cy.findByText('Help resources');
            cy.findByText('Getting Started');
            cy.findByText('Report a problem');
            cy.findByText('Keyboard shortcuts');

            // * Verify default link of Ask the community
            cy.findByText('Ask the community').
                parent().
                should('have.attr', 'href', 'https://mattermost.com/pl/default-ask-mattermost-community/');
        });
    });

    it('MM-T3289_2 - Help (Ask community link setting)', () => {
        // Disable setting for ask community
        cy.findByTestId('SupportSettings.EnableAskCommunityLinkfalse').click();

        // Edit help link and report a problem link
        cy.findByTestId('SupportSettings.HelpLinkinput').clear().type(helpLink);
        cy.findByTestId('SupportSettings.ReportAProblemLinkinput').clear().type(problemLink);

        // # Save setting and back to team view
        saveSetting();
        backToTeam();

        // # Open help menu
        cy.uiOpenHelpMenu().within(() => {
            // * Verify 4 options shown
            cy.findByText('Help resources');
            cy.findByText('Getting Started');
            cy.findByText('Report a problem');
            cy.findByText('Keyboard shortcuts');

            // * Verify help link has changed
            cy.findByText('Help resources').
                parent().
                should('have.attr', 'href', helpLink);

            // * Verify report a problem link has changed
            cy.findByText('Report a problem').
                parent().
                should('have.attr', 'href', problemLink);

            // # Click on keyboard shortcuts
            cy.findByText('Keyboard shortcuts').click();
        });

        // * Verify link opens keyboard shortcuts modal
        cy.findAllByRole('dialog', 'Keyboard shortcuts');
    });
});
