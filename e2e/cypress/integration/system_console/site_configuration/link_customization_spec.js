// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('SupportSettings', () => {
    const tosLink = 'https://github.com/mattermost/platform/blob/master/README.md';
    const privacyLink = 'https://github.com/mattermost/platform/blob/master/README.md';
    const aboutLink = 'http://www.mattermost.org/features/';
    const helpLink = 'https://github.com/mattermost/platform/blob/master/doc/help/README.md';
    const problemLink = 'https://forum.mattermost.org/c/general/trouble-shoot';

    const defaultTosLink = 'https://about.mattermost.com/default-terms/';

    let testTeam;

    beforeEach(() => {
        // # Login as admin and reset config
        cy.apiAdminLogin();
        cy.apiUpdateConfig();

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
        });

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

        // # Save setting
        saveSetting();

        // # Click Main Menu
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // * Verify that report link is changed
        cy.get('#reportLink').scrollIntoView();
        cy.get('#reportLink').should('be.visible').within(() => {
            cy.get('a').should('contain', 'Report a Problem').
                and('have.attr', 'href').and('equal', problemLink);
        });

        // * Verify that help link is changed
        cy.get('#helpLink').scrollIntoView();
        cy.get('#helpLink').should('be.visible').within(() => {
            cy.get('a').should('contain', 'Help').
                and('have.attr', 'href').and('equal', helpLink);
        });

        // * Verify that /help opens correct link
        // Note: This can not be tested with cypress yet, since it's opening link in a new tab
        // cy.postMessage('/help');
        // cy.url().should('equal', helpLink);

        // # Logout
        cy.apiLogout();
        cy.wait(TIMEOUTS.TWO_SEC);

        // * Verify that the user was redirected to the login page after the logout
        cy.url().should('include', '/login');

        // * Verify that links are correct
        cy.get('#about_link').should('contain', 'About').and('have.attr', 'href').and('equal', aboutLink);
        cy.get('#privacy_link').should('contain', 'Privacy').and('have.attr', 'href').and('equal', privacyLink);
        cy.get('#terms_link').should('contain', 'Terms').and('have.attr', 'href').and('equal', tosLink);
        cy.get('#help_link').should('contain', 'Help').and('have.attr', 'href').and('equal', helpLink);

        // # Visit signup page
        cy.get('#signup').click();

        // * Verify that links are correct
        cy.get('#about_link').should('contain', 'About').and('have.attr', 'href').and('equal', aboutLink);
        cy.get('#privacy_link').should('contain', 'Privacy').and('have.attr', 'href').and('equal', privacyLink);
        cy.get('#terms_link').should('contain', 'Terms').and('have.attr', 'href').and('equal', tosLink);
        cy.get('#help_link').should('contain', 'Help').and('have.attr', 'href').and('equal', helpLink);
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
        cy.get('#terms_link').should('contain', 'Terms').and('have.attr', 'href').and('equal', defaultTosLink);
    });

    it('MM-T1036 - Customization: Blank Help and Report a Problem hides options from main menu', () => {
        // # Change help and report links to blanks
        cy.findByTestId('SupportSettings.HelpLinkinput').type('any').clear();
        cy.findByTestId('SupportSettings.ReportAProblemLinkinput').type('any').clear();

        // # Save setting
        saveSetting();

        // # Click Main Menu
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // * Verify that report link does not exist
        cy.get('#reportLink').should('not.exist');

        // * Verify that help link does not exist
        cy.get('#helpLink').should('not.exist');
    });

    it('MM-T1038 - Customization App download link - Change to different', () => {
        // # Edit links in the support email field
        const link = 'some_link';
        cy.findByTestId('NativeAppSettings.AppDownloadLinkinput').clear().type(link);

        // # Save setting
        saveSetting();

        // # Click Main Menu
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // * Verify that app link is changed
        cy.get('#nativeAppLink').scrollIntoView();
        cy.get('#nativeAppLink').should('be.visible').within(() => {
            cy.get('a').should('contain', 'Download Apps').
                and('have.attr', 'href').and('equal', link);
        });
    });

    it('MM-T3289_1 - Help (Ask community link setting)', () => {
        // * Verify enable ask community link to be true by default
        cy.findByTestId('SupportSettings.EnableAskCommunityLinktrue').should('be.checked');

        // * Verify the help text
        cy.findByTestId('SupportSettings.EnableAskCommunityLinkhelp-text').should('contain', 'When true, "Ask the community" link appears on the Mattermost user interface and Main Menu, which allows users to join the Mattermost Community to ask questions and help others troubleshoot issues. When false, the link is hidden from users.');

        // # Click Main Menu
        cy.visit(`/${testTeam.name}/channels/town-square`);

        cy.get('#channel-header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').within(() => {
            // * Verify that hover shows "Help" text
            cy.get('#channelHeaderUserGuideButton').trigger('mouseover', {force: true});
            cy.get('#channelHeaderUserGuideButton').should('have.attr', 'aria-describedby').and('equal', 'userGuideHelpTooltip');
            cy.get('#channelHeaderUserGuideButton').trigger('mouseout', {force: true});
            cy.get('#channelHeaderUserGuideButton').should('not.have.attr', 'aria-describedby');

            // # Click on the help icon
            cy.get('#channelHeaderUserGuideButton').click();

            // * Verify 4 options shown
            cy.get('#askTheCommunityLink').should('be.visible');
            cy.get('#helpResourcesLink').should('be.visible');
            cy.get('#reportAProblemLink').should('be.visible');
            cy.get('#keyboardShortcuts').should('be.visible');

            // * Verify ask the default ask the community link
            cy.get('#askTheCommunityLink').within(() => {
                cy.get('a').should('have.attr', 'href').and('equal', 'https://mattermost.com/pl/default-ask-mattermost-community/');
            });
        });
    });

    it('MM-T3289_2 - Help (Ask community link setting)', () => {
        // Disable setting for ask community
        cy.findByTestId('SupportSettings.EnableAskCommunityLinkfalse').click();

        // Edit help link and report a problem link
        cy.findByTestId('SupportSettings.HelpLinkinput').clear().type(helpLink);
        cy.findByTestId('SupportSettings.ReportAProblemLinkinput').clear().type(problemLink);

        // # Save setting
        saveSetting();

        // # Go to town-square
        cy.visit(`/${testTeam.name}/channels/town-square`);

        cy.get('#channel-header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').within(() => {
            // # Click on the help icon
            cy.get('#channelHeaderUserGuideButton').click();

            // * Verify only 3 options shown
            cy.get('#askTheCommunityLink').should('not.exist');
            cy.get('#helpResourcesLink').should('be.visible');
            cy.get('#reportAProblemLink').should('be.visible');
            cy.get('#keyboardShortcuts').should('be.visible');

            // * Verify help link has changed
            cy.get('#helpResourcesLink').within(() => {
                cy.get('a').should('have.attr', 'href').and('equal', helpLink);
            });

            // * Verify report a problem link has changed
            cy.get('#reportAProblemLink').within(() => {
                cy.get('a').should('have.attr', 'href').and('equal', problemLink);
            });

            // # Click on keyboard shortcuts
            cy.get('#keyboardShortcuts').click();
        });

        // * Verify link opens keyboard shortcuts modal
        cy.get('#shortcutsModalLabel').should('be.visible');
    });
});

function saveSetting() {
    // # Click save button, and verify text and visibility
    cy.get('#saveSetting').
        should('have.text', 'Save').
        and('be.enabled').
        click().
        should('be.disabled').
        wait(TIMEOUTS.HALF_SEC);
}
