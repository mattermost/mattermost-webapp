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
                    SupportEmail: config.SupportSettings.SupportEmail,
                    HelpLink: config.SupportSettings.HelpLink,
                    AboutLink: config.SupportSettings.AboutLink,
                    PrivacyPolicyLink: config.SupportSettings.PrivacyPolicyLink,
                },
                TeamSettings: {
                    SiteName: config.TeamSettings.SiteName,
                },
                NativeAppSettings: {
                    AppDownloadLink: config.NativeAppSettings.AppDownloadLink,
                    AndroidAppDownloadLink: config.NativeAppSettings.AndroidAppDownloadLink,
                    IosAppDownloadLink: config.NativeAppSettings.IosAppDownloadLink,
                },
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

    it('SC20330 - Can change Privacy Policy Link setting', () => {
        // * Verify that setting is visible and matches text content
        cy.findByTestId('SupportSettings.PrivacyPolicyLinklabel').scrollIntoView().should('be.visible').and('have.text', 'Privacy Policy Link:');

        // * Verify that help setting is visible and matches text content
        const content = 'The URL for the Privacy link on the login and sign-up pages. If this field is empty, the Privacy link is hidden from users.';
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkhelp-text').scrollIntoView().find('span').should('be.visible').and('have.text', content);

        // * Verify the input box visible and has default value
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkinput').scrollIntoView().should('have.value', origConfig.SupportSettings.PrivacyPolicyLink).and('be.visible');

        // # Fill input field with value
        const stringToSave = 'https://some.com';
        cy.findByTestId('SupportSettings.PrivacyPolicyLinkinput').clear().type(stringToSave);

        cy.get('#saveSetting').click();

        // * Verify that the value is save, directly via REST API
        cy.apiGetConfig().then((response) => {
            expect(response.body.SupportSettings.PrivacyPolicyLink).to.equal(stringToSave);
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

    it('SC20333 - Can change Mattermost Apps Download Page Link setting', () => {
        // * Verify Mattermost Apps Download Page Link's setting name is visible and matches the text
        cy.findByTestId('NativeAppSettings.AppDownloadLinklabel').scrollIntoView().should('be.visible').and('have.text', 'Mattermost Apps Download Page Link:');

        // * Verify the Mattermost Apps Download Page Link input box has default value. The default value depends on the setup before running the test.
        cy.findByTestId('NativeAppSettings.AppDownloadLinkinput').should('have.value', origConfig.NativeAppSettings.AppDownloadLink);

        // * Verify the site name's help text is visible and matches the text
        cy.findByTestId('NativeAppSettings.AppDownloadLinkhelp-text').find('span').should('be.visible').and('have.text', 'Add a link to a download page for the Mattermost apps. When a link is present, an option to "Download Mattermost Apps" will be added in the Main Menu so users can find the download page. Leave this field blank to hide the option from the Main Menu.');

        // # Generate and enter a random site name
        const siteName = 'New site name';
        cy.findByTestId('NativeAppSettings.AppDownloadLinkinput').clear().type(siteName);

        // # Click Save button
        cy.get('#saveSetting').click();

        // Get config again
        cy.apiGetConfig().then((response) => {
            const config = response.body;

            // * Verify the site name is saved, directly via REST API
            expect(config.NativeAppSettings.AppDownloadLink).to.eq(siteName);
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
        cy.findByTestId('SupportSettings.AboutLinkhelp-text').should('be.visible').and('have.text', 'The URL for the About link on the Mattermost login and sign-up pages. If this field is empty, the About link is hidden from users.');

        // * Verify that the existing is visible and has default value
        cy.findByTestId('SupportSettings.AboutLinkinput').should('be.visible').and('have.value', origConfig.SupportSettings.AboutLink);

        // # Clear existing about link and type the new about link
        cy.findByTestId('SupportSettings.AboutLinkinput').clear().type(newAboutLink);

        // # Click the save button
        cy.get('#saveSetting').click();

        cy.apiGetConfig().then((response) => {
            expect(response.body.SupportSettings.AboutLink).to.equal(newAboutLink);
        });
    });
});
