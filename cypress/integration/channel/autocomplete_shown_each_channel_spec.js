// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Identical Message Drafts', () => {
    before(() => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');
    });

    it('M14432 shows Autocomplete in each channel', () => {

        // 1. Go to test Channel A on sidebar
        cy.get('#sidebarItem_town-square').scrollIntoView();
        cy.get('#sidebarItem_town-square').should('be.visible').click();

        // * Validate if the channel has been opened
        cy.url().should('include', '/ad-1/channels/town-square');


        // 2. Start a draft in Channel A containing just "@"
        cy.get('#post_textbox').scrollIntoView();
        cy.get('#post_textbox').clear().type('@');

        // * At mention auto-complete appears in Channel A
        cy.get('#suggestionList').should('be.visible')

        // 3. Go to test Channel B on sidebar
        cy.get('#sidebarItem_ratione-1').scrollIntoView();
        cy.get('#sidebarItem_ratione-1').should('be.visible').click();

        //* Validate if the newly navigated channel is open
        cy.url().should('include', '/ad-1/channels/ratione-1');

        // 4. Start a draft in Channel B containing just "@"
        cy.get('#post_textbox').scrollIntoView();
        cy.get('#post_textbox').clear().type('@');

        // * At mention auto-complete appears in Channel B
        cy.get('#suggestionList').should('be.visible');

        // 5. Go back to test Channel A on sidebar
        cy.get('#sidebarItem_town-square').scrollIntoView();
        cy.get('#sidebarItem_town-square').should('be.visible').click();

        // * Validate if the channel has been opened
        // * At mention auto-complete is preserved in Channel A
        cy.url().should('include', '/ad-1/channels/town-square');
        cy.get('#suggestionList').should('be.visible')

    });
});
