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
    let testTeam;
    let testUser;

    before(() => {
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;
        });
    });

    it('MM-T711_1 - Click on menu item should toggle the menu', () => {
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

        cy.get('#lhsHeader').should('be.visible').within(() => {
            cy.get('#sidebarHeaderDropdownButton').click();
            cy.get('.dropdown-menu').should('be.visible');
            cy.get('#accountSettings').should('be.visible').click();
            cy.get('.dropdown-menu').should('not.be.visible');
        });
    });

    it('MM-T711_2 - Click on menu divider shouldn\'t toggle the menu', () => {
        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/town-square`);

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
            cy.apiAdminLogin();
            cy.visit(`/${testTeam.name}/channels/town-square`);

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
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/town-square`);

            cy.get('#lhsHeader').should('be.visible').within(() => {
                cy.get('#sidebarHeaderDropdownButton').click();
                cy.get('.dropdown-menu').should('be.visible').within(() => {
                    cy.get('#integrations').should('not.be.visible');
                });
            });
        });
    });
});
