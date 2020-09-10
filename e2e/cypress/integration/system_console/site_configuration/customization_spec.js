// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Customization', () => {
    beforeEach(() => {
        // # as many of the tests logout the user, ensure it's logged
        // in as an admin before each test
        cy.apiAdminLogin();

        // # Visit customization system console page
        cy.visit('/admin_console/site_config/customization');
        cy.get('.admin-console__header').should('be.visible').and('have.text', 'Customization');
    });

    it('MM-T1024 - Can change name and desc with Custom Branding set to false', () => {
        // # Make sure necessary field is false
        cy.apiUpdateConfig({TeamSettings: {EnableCustomBrand: false}});
        cy.reload();

        // * Verify that setting is visible and matches text content
        cy.findByTestId('TeamSettings.SiteNamelabel').scrollIntoView().should('be.visible').and('have.text', 'Site Name:');

        // # Update both Site Name and Description to store test values
        const siteName = 'Mattermost_Text';
        const siteDescription = 'This is a testing Mattermost site';
        cy.findByTestId('TeamSettings.SiteNameinput').clear().type(siteName);
        cy.findByTestId('TeamSettings.CustomDescriptionTextinput').clear().type(siteDescription);

        // # Save setting
        saveSetting();

        // # Logout
        cy.apiLogout();

        // * Ensure that the user was redirected to the login page after the logout
        cy.url().should('include', '/login');

        // * Ensure Site Name and Description are shown the updated values in the login screen
        cy.get('#site_name').should('have.text', siteName);
        cy.get('#site_description').should('have.text', siteDescription);
    });

    it('MM-T1026 - Custom Branding - Name character limit', () => {
        // * Verify that setting is visible and matches text content
        cy.findByTestId('TeamSettings.SiteNamelabel').scrollIntoView().should('be.visible').and('have.text', 'Site Name:');

        // Character limit is 30, and Mattermost is exactly 10 characters long
        const siteName = 'Mattermost'.repeat(3);

        // # Type the maximum amount of characters and then some more
        cy.findByTestId('TeamSettings.SiteNameinput').clear().type(siteName + 'something else');

        // * Verify that the input field didn't accept more characters than the limit
        cy.findByTestId('TeamSettings.SiteNameinput').should('have.value', siteName);

        // # Save setting
        saveSetting();

        // * Verify that the value was saved correctly, without the extra characters
        cy.apiGetConfig().then(({config}) => {
            expect(config.TeamSettings.SiteName).to.equal(siteName);
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
