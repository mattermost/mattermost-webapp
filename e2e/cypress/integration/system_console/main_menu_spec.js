// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console

// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};

describe('Main menu', () => {
    before(() => {
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

    it('T909 Can switch to team', () => {
        // * Verify teams are visible
        cy.findByText('Switch to eligendi').should('be.visible');
    });

    it('T910 Can open Administrators Guide', () => {
        // * Verify administrator's guide link
        verifyLink("Administrator's Guide", 'https://about.mattermost.com/administrators-guide/');
    });

    it('T911 Can open Troubleshooting Forum', () => {
        // * Verify troubleshooting forum link
        verifyLink('Troubleshooting Forum', 'https://about.mattermost.com/troubleshooting-forum/');
    });

    it('T912 Can open Commercial Support', () => {
        // * Verify commercial support
        verifyLink('Commercial Support', 'https://about.mattermost.com/commercial-support/');
    });

    it('T914 Can log out from system console', () => {
        // * Verify log out button is visible
        cy.findByText('Log Out').should('be.visible');
    });

    it('T913 About opens About modal', () => {
        // # click to open about modal
        cy.findByText('About Mattermost').click();

        // * Verify about.mattermost.com link text has correct link destination and opens in a new tab
        verifyLink('about.mattermost.com', 'http://about.mattermost.com/');

        // * Verify server link text has correct link destination and opens in a new tab
        verifyLink('server', 'https://about.mattermost.com/platform-notice-txt/');

        // * Verify link text has correct link destination and opens in a new tab
        verifyLink('desktop', 'https://about.mattermost.com/desktop-notice-txt/');

        // * Verify link text has correct matches link destination and opens in a new tab
        verifyLink('mobile', 'https://about.mattermost.com/mobile-notice-txt/');

        // * Verify version exists in modal
        cy.findByText('Mattermost Version:').should('be.visible');

        // * Verify build hash exists in modal
        cy.findByText('Build Hash:').should('be.visible');

        // * Verify build date exists in modal
        cy.findByText('Build Date:').should('be.visible');
    });
});

