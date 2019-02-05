// Copyright (c) 2019-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Teams Suite', () => {
    before(() => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');
    });

    it('Create a team', () => {

        //  Click hamburger main menu
        cy.get('#sidebarHeaderDropdownButton').click();

        // dropdown menu should be visible then click create team
        cy.get('#sidebarDropdownMenu').should('be.visible').within(function($el) {
           cy.get('#createTeam').should('be.visible').click();
        });

        // input team name as Team Test
        cy.get("input[type=text]").should('be.visible').type("Team Test");

        // click next
        cy.get("button[type=submit]").should('be.visible').click();

        // input team url as team-test-e2e
        cy.get("input[type=text]").should('be.visible').type("team-test-e2e");

        // click finish
        cy.get("button[type=submit]").should('be.visible').click();

        // should redirect ot Town Square channel
        cy.get('#channelHeaderTitle').should('contain','Town Square');

        // check url is correct
        cy.url().should('include','team-test-e2e/channels/town-square');

    });


});
