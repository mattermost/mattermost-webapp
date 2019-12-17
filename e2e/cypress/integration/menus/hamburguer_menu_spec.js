// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const testCases = [
    {command: '/away', ariaLabel: 'Away Icon', message: 'You are now away'},
    {command: '/dnd', ariaLabel: 'Do Not Disturb Icon', message: 'Do Not Disturb is enabled. You will not receive desktop or mobile push notifications until Do Not Disturb is turned off.'},
    {command: '/offline', ariaLabel: 'Offline Icon', message: 'You are now offline'},
    {command: '/online', ariaLabel: 'Online Icon', message: 'You are now online'},
];

describe('Hamburguer menu', () => {
    beforeEach(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('MM-20861 - Click on menu item should toggle the menu', () => {
        cy.get('#lhsHeader').should('be.visible').within(() => {
            cy.get('#sidebarHeaderDropdownButton').click();
            cy.get('.dropdown-menu').should('be.visible');
            cy.get('#accountSettings').should('be.visible').click();
            cy.get('.dropdown-menu').should('not.be.visible');
        });
    });

    it('MM-20861 - Click on menu divider shouldn\'t toggle the menu', () => {
        cy.get('#lhsHeader').should('be.visible').within(() => {
            cy.get('#sidebarHeaderDropdownButton').click();
            cy.get('.dropdown-menu').should('be.visible').within((el) => {
                cy.get('.menu-divider:visible').first().click();
                cy.wrap(el).should('be.visible');
            });
        });
    });
});