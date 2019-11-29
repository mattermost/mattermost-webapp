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
                    HelpLink: config.SupportSettings.HelpLink,
                    SupportEmail: config.SupportSettings.SupportEmail,
                },
                NativeAppSettings: {
                    AndroidAppDownloadLink: config.NativeAppSettings.AndroidAppDownloadLink,
                    IosAppDownloadLink: config.NativeAppSettings.IosAppDownloadLink,
                },
                TeamSettings: {SiteName: config.TeamSettings.SiteName},
            };
        });

        // # Login as sysadmin and visit customization system console page
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/site_config/customization');
        cy.get('.admin-console__header').should('be.visible').and('have.text', 'Customization');
    });

    after(() => {
        cy.apiUpdateConfig(origConfig);
    });

    it('SC20335 - Can change Site Name setting', () => {
        // * Verify site name's setting name for is visible and matches the text
        cy.findByTestId('TeamSettings.SiteNamelabel').should('be.visible').and('have.text', 'Site Name:');

        // * Verify the site name input box has default value. The default value depends on the setup before running the test.
        cy.findByTestId('TeamSettings.SiteNameinput').should('have.value', origConfig.TeamSettings.SiteName);

        // * Verify the site name's help text is visible and matches the text
        cy.findByTestId('TeamSettings.SiteNamehelp-text').find('span').should('be.visible').and('have.text', 'Name of service shown in login screens and UI. When not specified, it defaults to "Mattermost".');

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

    it('SC20337 Can change Support Email setting', () => {
        // # Scroll Support Email section into view and verify that it's visible
        cy.findByTestId('SupportSettings.SupportEmail').scrollIntoView().should('be.visible');

        // * Verify that setting label is visible and matches text content
        cy.findByTestId('SupportSettings.SupportEmaillabel').should('be.visible').and('have.text', 'Support Email:');

        // * Verify the Support Email input box has default value. The default value depends on the setup before running the test.
        cy.findByTestId('SupportSettings.SupportEmailinput').should('have.value', origConfig.SupportSettings.SupportEmail);

        // * Verify that the help text is visible and matches text content
        cy.findByTestId('SupportSettings.SupportEmailhelp-text').find('span').should('be.visible').and('have.text', 'Email address displayed on email notifications and during tutorial for end users to ask support questions.');

        const newEmail = 'support@example.com';

        // * Verify that set value is visible and matches text
        cy.findByTestId('SupportSettings.SupportEmail').find('input').clear().type(newEmail).should('have.value', newEmail);

        // # Update Support Email
        cy.get('#saveSetting').click();

        // * Verify that the config is correctly saved in the server
        cy.apiGetConfig().then((response) => {
            expect(response.body.SupportSettings.SupportEmail).to.equal(newEmail);
        });
    });

    it('SC20338 Can change Android App Download Link setting', () => {
        // # Scroll Android App Download Link section into view and verify that it's visible
        cy.findByTestId('NativeAppSettings.AndroidAppDownloadLink').scrollIntoView().should('be.visible');

        // * Verify that Android App Download Link label is visible and matches text content
        cy.findByTestId('NativeAppSettings.AndroidAppDownloadLinklabel').should('be.visible').and('have.text', 'Android App Download Link:');

        // * Verify the Android App Download Link input box has default value. The default value depends on the setup before running the test.
        cy.findByTestId('NativeAppSettings.AndroidAppDownloadLinkinput').should('have.value', origConfig.NativeAppSettings.AndroidAppDownloadLink);

        // * Verify that the help text is visible and matches text content
        cy.findByTestId('NativeAppSettings.AndroidAppDownloadLinkhelp-text').find('span').should('be.visible').and('have.text', 'Add a link to download the Android app. Users who access the site on a mobile web browser will be prompted with a page giving them the option to download the app. Leave this field blank to prevent the page from appearing.');

        const newAndroidAppDownloadLink = 'https://example.com/android-app/';

        // * Verify that set value is visible and matches text
        cy.findByTestId('NativeAppSettings.AndroidAppDownloadLinkinput').clear().type(newAndroidAppDownloadLink).should('have.value', newAndroidAppDownloadLink);

        // # Update Support Email
        cy.get('#saveSetting').click();

        // * Verify that the config is correctly saved in the server
        cy.apiGetConfig().then((response) => {
            expect(response.body.NativeAppSettings.AndroidAppDownloadLink).to.equal(newAndroidAppDownloadLink);
        });
    });

    it('SC20340 Can change iOS App Download Link setting', () => {
        // # Scroll iOS App Download Link section into view and verify that it's visible
        cy.findByTestId('NativeAppSettings.IosAppDownloadLink').scrollIntoView().should('be.visible');

        // * Verify that iOS App Download Link label is visible and matches text content
        cy.findByTestId('NativeAppSettings.IosAppDownloadLinklabel').should('be.visible').and('have.text', 'iOS App Download Link:');

        // * Verify the iOS App Download Link input box has default value. The default value depends on the setup before running the test.
        cy.findByTestId('NativeAppSettings.IosAppDownloadLinkinput').should('have.value', origConfig.NativeAppSettings.IosAppDownloadLink);

        // * Verify that the help text is visible and matches text content
        cy.findByTestId('NativeAppSettings.IosAppDownloadLinkhelp-text').find('span').should('be.visible').and('have.text', 'Add a link to download the iOS app. Users who access the site on a mobile web browser will be prompted with a page giving them the option to download the app. Leave this field blank to prevent the page from appearing.');

        const newIosAppDownloadLink = 'https://example.com/iOS-app/';

        // * Verify that set value is visible and matches text
        cy.findByTestId('NativeAppSettings.IosAppDownloadLinkinput').clear().type(newIosAppDownloadLink).should('have.value', newIosAppDownloadLink);

        // # Update Support Email
        cy.get('#saveSetting').click();

        // * Verify that the config is correctly saved in the server
        cy.apiGetConfig().then((response) => {
            expect(response.body.NativeAppSettings.IosAppDownloadLink).to.equal(newIosAppDownloadLink);
        });
    });
});
