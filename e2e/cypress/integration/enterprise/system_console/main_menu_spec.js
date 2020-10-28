// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @system_console

// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};

describe('Main menu', () => {
    before(() => {
        // * Check if server has license
        cy.apiRequireLicense();

        // # Go to admin console
        goToAdminConsole();

        // # Open the hamburger menu
        cy.get('button > span[class="menu-icon"]').click();
    });

    const verifyLink = (text, link) => {
        // * Verify link opens in new tab
        cy.get('a[href="' + link + '"]').scrollIntoView().should('have.attr', 'target', '_blank');

        // * Verify link text matches correct href value
        cy.get('a[href="' + link + '"]').contains(text);
    };

    it('MM-T913 About opens About modal', () => {
        // # click to open about modal
        cy.findByText('About Mattermost').click();

        // * Verify server link text has correct link destination and opens in a new tab
        verifyLink('server', 'https://about.mattermost.com/platform-notice-txt/');

        // * Verify link text has correct link destination and opens in a new tab
        verifyLink('desktop', 'https://about.mattermost.com/desktop-notice-txt/');

        // * Verify link text has correct matches link destination and opens in a new tab
        verifyLink('mobile', 'https://about.mattermost.com/mobile-notice-txt/');

        // * Verify version exists in modal
        cy.findByText('Mattermost Version:').should('be.visible');

        // * Verify licensed to exists in modal
        cy.findByText('Licensed to:').should('be.visible');
    });

    it('MM-T899 - Edition and License: Verify Privacy Policy link points to correct URL', () => {
        goToAdminConsole();

        // * Find privacy link and then assert that the href is what we expect it to be
        cy.findByTestId('privacyPolicyLink').then((el) => {
            expect(el[0].href).equal('https://about.mattermost.com/default-privacy-policy/');
        });
    });
});

