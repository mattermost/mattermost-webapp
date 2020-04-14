// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @menu

describe('Main menu', () => {
    it('MM-20861 - Click on menu item should toggle the menu', () => {
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        cy.get('#lhsHeader').should('be.visible').within(() => {
            cy.get('#sidebarHeaderDropdownButton').click();
            cy.get('.dropdown-menu').should('be.visible');
            cy.get('#accountSettings').should('be.visible').click();
            cy.get('.dropdown-menu').should('not.be.visible');
        });
    });

    it('MM-20861 - Click on menu divider shouldn\'t toggle the menu', () => {
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        cy.get('#lhsHeader').should('be.visible').within(() => {
            cy.get('#sidebarHeaderDropdownButton').click();
            cy.get('.dropdown-menu').should('be.visible').within((el) => {
                cy.get('.menu-divider:visible').first().click();
                cy.wrap(el).should('be.visible');
            });
        });
    });

    describe('should show integrations option', () => {
        it('for system administrator', () => {
            cy.apiLogin('sysadmin');
            cy.visit('/ad-1/channels/town-square');

            cy.get('#lhsHeader').should('be.visible').within(() => {
                cy.get('#sidebarHeaderDropdownButton').click();
                cy.get('.dropdown-menu').should('be.visible').within(() => {
                    cy.get('#integrations').should('be.visible');
                });
            });
        });
    });

    describe('should not show integrations option', () => {
        it('for team member without permissions', () => {
            cy.apiLogin('user-1');
            cy.visit('/ad-1/channels/town-square');

            cy.get('#lhsHeader').should('be.visible').within(() => {
                cy.get('#sidebarHeaderDropdownButton').click();
                cy.get('.dropdown-menu').should('be.visible').within(() => {
                    cy.get('#integrations').should('not.be.visible');
                });
            });
        });
    });
});
