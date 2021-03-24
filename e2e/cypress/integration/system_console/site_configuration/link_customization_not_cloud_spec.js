// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @not_cloud @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('SupportSettings', () => {
    const tosLink = 'https://github.com/mattermost/platform/blob/master/README.md';
    const privacyLink = 'https://github.com/mattermost/platform/blob/master/README.md';
    const email = 'bot@mattermost.com';

    const defaultTosLink = 'https://about.mattermost.com/default-terms/';
    const defaultPrivacyLink = 'https://about.mattermost.com/default-privacy-policy/';

    let testTeam;

    beforeEach(() => {
        cy.shouldNotRunOnCloudEdition();

        // # Login as admin and reset config
        cy.apiAdminLogin();
        cy.apiUpdateConfig();

        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
        });

        // # Visit customization system console page
        cy.visit('/admin_console/site_config/customization');
    });

    it('MM-T1032 - Customization: Custom Terms and Privacy links in the About modal', () => {
        // # Edit links in the TOS and Privacy fields
        cy.findByTestId('SupportSettings.TermsOfServiceLinkinput').clear().type(tosLink);
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkinput').clear().type(privacyLink);

        // # Save setting
        saveSetting();

        // # Open about modal
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#about').click();

        // * Verify that links do not change and they open to default pages
        cy.get('#tosLink').should('contain', 'Terms of Service').and('have.attr', 'href').and('equal', defaultTosLink);
        cy.get('#privacyLink').should('contain', 'Privacy Policy').and('have.attr', 'href').and('equal', defaultPrivacyLink);
    });

    it('MM-T1034 - Customization: Blank TOS link field (About modal)', () => {
        // # Empty the "terms of services" field
        cy.findByTestId('SupportSettings.TermsOfServiceLinkinput').type('any').clear();

        // # Save setting
        saveSetting();

        // # Open about modal
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#about').click();

        // * Verify that tos link is set to default
        cy.get('#tosLink').should('contain', 'Terms of Service').and('have.attr', 'href').and('equal', defaultTosLink);
    });

    it('MM-T1035 - Customization Blank Privacy hides the link', () => {
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkinput').clear();

        // # Save setting
        saveSetting();

        // # Open about modal
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#about').click();

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

    it('MM-T1037 - Customization Custom Support Email', () => {
        // # Edit links in the support email field
        cy.findByTestId('SupportSettings.SupportEmailinput').clear().type(email);

        // # Save setting
        saveSetting();

        // # Create new user to run tutorial
        cy.apiCreateUser({bypassTutorial: false}).then(({user: user1}) => {
            cy.apiAddUserToTeam(testTeam.id, user1.id);

            cy.apiLogin(user1);
            cy.visit(`/${testTeam.name}/channels/town-square`);

            // # Hit "Next" twice
            cy.get('#tutorialNextButton').click();
            cy.get('#tutorialNextButton').click();

            // * Verify that proper email is displayed
            cy.get('#supportInfo').within(() => {
                cy.get('a').should('have.attr', 'href').and('equal', 'mailto:' + email);
            });
        });
    });

    it('MM-T1039 - Customization App download link - Remove', () => {
        // # Edit links in the support email field
        cy.findByTestId('NativeAppSettings.AppDownloadLinkinput').type('any').clear();

        // # Save setting
        saveSetting();

        // # Click Main Menu
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // * Verify that app link does not exist
        cy.get('#nativeAppLink').should('not.exist');

        // # Create new user to run tutorial
        cy.apiCreateUser({bypassTutorial: false}).then(({user: user1}) => {
            cy.apiAddUserToTeam(testTeam.id, user1.id);

            cy.apiLogin(user1);
            cy.visit(`/${testTeam.name}/channels/town-square`);

            // # Hit "Next"
            cy.get('#tutorialNextButton').click();

            // * Verify that app download link does not exist
            cy.get('#appDownloadLink').should('not.exist');
        });
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
