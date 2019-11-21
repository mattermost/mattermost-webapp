// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Customization', () => {
    let config;

    beforeEach(() => {
        // Get config
        cy.apiGetConfig().then(response => {
            config = response.body;
        });

        // # Login as System Admin
        cy.apiLogin('sysadmin');

        // visit site config customization page
        cy.visit('/admin_console/site_config/customization');
    });

    it('SC20335 - Can change Site Name setting', () => {
        // * Verify site name's setting name for is visible and matches the text
        cy.get('[data-testid="TeamSettings.SiteName"] > label').should('be.visible').and('have.text', 'Site Name:');

        // * Verify the input box has default value. The default value depends on the setup before running the test.
        cy.get('[id="TeamSettings.SiteName"]').should('have.value', config.TeamSettings.SiteName);

        // * Verify the help text is visible and matches the text
        cy.get('[data-testid="TeamSettings.SiteNamehelp-text"] > span').should('be.visible').and('have.text', 'Name of service shown in login screens and UI. When not specified, it defaults to "Mattermost".');

        // # Generate and enter a random site name
        const siteName = Math.random().toString(36).substring(2, 8);
        cy.get('[id="TeamSettings.SiteName"]').clear().type(siteName);

        // # Click Save button
        cy.get('#saveSetting').click();

        // Get config again
        cy.apiGetConfig().then(response => {
            config = response.body;
            // * Verify the site name is saved, directly via REST API
            expect(config.TeamSettings.SiteName).to.eq(siteName);
        });
    });
});
