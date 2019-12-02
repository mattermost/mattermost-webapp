// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Customization', () => {
    let origConfig;

    before(() => {
        // Get config
        cy.apiGetConfig().then((response) => {
            const config = response.body;
            origConfig = {
                SupportSettings: {
                    AboutLink: config.SupportSettings.AboutLink,
                    HelpLink: config.SupportSettings.HelpLink,
                },
                TeamSettings: {
                    SiteName: config.TeamSettings.SiteName,
                },
            };
        });

        // # Login as sysadmin and visit customization system console page
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/site_config/customization');
    });

    after(() => {
        cy.apiUpdateConfig(origConfig);
    });

    it('SC20335 - Can change Site Name setting', () => {
        // * Verify site name's setting name for is visible and matches the text
        cy.findByTestId('TeamSettings.SiteNamelabel').scrollIntoView().should('be.visible').and('have.text', 'Site Name:');

        // * Verify the site name input box has default value. The default value depends on the setup before running the test.
        cy.findByTestId('TeamSettings.SiteNameinput').should('have.value', origConfig.TeamSettings.SiteName);

        // * Verify the site name's help text is visible and matches the text
        cy.findByTestId('TeamSettings.SiteNamehelp-text').should('be.visible').and('have.text', 'Name of service shown in login screens and UI. When not specified, it defaults to "Mattermost".');

        // # Generate and enter a random site name
        const siteName = 'New site name';
        cy.findByTestId('TeamSettings.SiteNameinput').clear().type(siteName);

        // # Click Save button
        cy.get('#saveSetting').click();

        // Get config again
        cy.apiGetConfig().then((response) => {
            const config = response.body;

            // * Verify the site name is saved, directly via REST API
            expect(config.TeamSettings.SiteName).to.eq(siteName);
        });
    });

    it('SC20330 - Can change Help Link setting', () => {
        // * Verify that setting is visible and matches text content
        const contents = ['The URL for the Help link on the Mattermost login page, sign-up pages, and Main Menu. If this field is empty, the Help link is hidden from users.'];
        cy.findByTestId('SupportSettings.HelpLinklabel').scrollIntoView().should('be.visible').and('have.text', 'Help Link:');

        // * Verify that help setting is visible and matches text content
        cy.findByTestId('SupportSettings.HelpLinkhelp-text').scrollIntoView().find('span').should('be.visible').and('have.text', contents[0]);

        // * Verify the input box visible and has default value
        cy.findByTestId('SupportSettings.HelpLinkinput').scrollIntoView().should('have.value', origConfig.SupportSettings.HelpLink).and('be.visible');

        // # Fill input field with value
        const stringToSave = 'https://some.com';
        cy.findByTestId('SupportSettings.HelpLinkinput').clear().type(stringToSave);

        cy.get('#saveSetting').click();

        // * Verify that the value is save, directly via REST API
        cy.apiGetConfig().then((response) => {
            expect(response.body.SupportSettings.HelpLink).to.equal(stringToSave);
        });
    });
  
    it('SC20341 Can change About Link setting', () => {
        const newAboutLink = 'https://about.mattermost.com/new-about-page/';

        // * Verify that setting is visible and has the correct label text
        cy.findByTestId('SupportSettings.AboutLinklabel').scrollIntoView().should('be.visible').and('have.text', 'About Link:');

        // * Verify that the help text is visible and matches text content
        cy.findByTestId('SupportSettings.AboutLinkhelp-text').
            should('be.visible').and('have.text', 'The URL for the About link on the Mattermost login and sign-up pages. If this field is empty, the About link is hidden from users.');

        // * Verify that the existing is visible and has default value
        cy.findByTestId('SupportSettings.AboutLinkinput').should('be.visible').
            and('have.value', origConfig.SupportSettings.AboutLink);

        // # Clear existing about link and type the new about link
        cy.findByTestId('SupportSettings.AboutLinkinput').clear().type(newAboutLink);

        // # Click the save button
        cy.get('#saveSetting').click();

        cy.apiGetConfig().then((response) => {
            expect(response.body.SupportSettings.AboutLink).to.equal(newAboutLink);
        });
    });
});
