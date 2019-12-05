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
                SupportSettings: {HelpLink: config.SupportSettings.HelpLink},
                TeamSettings: {
                    SiteName: config.TeamSettings.SiteName,
                    EnableCustomBrand: config.TeamSettings.EnableCustomBrand
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

    it('SC20339 - Can change Enable Custom Branding setting', () => {
        // # Make sure necessary field is false
        cy.apiUpdateConfigBasic({TeamSettings: {EnableCustomBrand: false}});
        cy.reload();

        cy.findByTestId('TeamSettings.EnableCustomBrand').should('be.visible').within(() => {
            // * Verify that setting is visible and matches text content
            cy.get('label:first').should('be.visible').and('have.text', 'Enable Custom Branding: ');

            // * Verify that help setting is visible and matches text content
            const content = 'Enable custom branding to show an image of your choice, uploaded below, and some help text, written below, on the login page.';
            cy.get('.help-text').should('be.visible').and('have.text', content);

            // # Set Enable Custom Branding to true
            cy.findByTestId('TeamSettings.EnableCustomBrandtrue').check();
        });

        // # Click Save button
        cy.get('#saveSetting').click();

        // * Verify that the value is save, directly via REST API
        cy.apiGetConfig().then((response) => {
            expect(response.body.TeamSettings.EnableCustomBrand).to.equal(true);
        });

        // # Set Enable Custom Branding to false
        cy.findByTestId('TeamSettings.EnableCustomBrandfalse').check();

        // # Click Save button
        cy.get('#saveSetting').click();

        // * Verify that the value is save, directly via REST API
        cy.apiGetConfig().then((response) => {
            expect(response.body.TeamSettings.EnableCustomBrand).to.equal(false);
        });
    });
});
