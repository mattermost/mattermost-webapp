// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] in dicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Identical Message Drafts', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // # Clear channel textbox
        cy.clearPostTextbox('town-square');
        cy.clearPostTextbox('autem-2');
    });

    it('M14432 shows Autocomplete in each channel', () => {
        // # Go to test Channel A on sidebar
        cy.get('#sidebarItem_town-square').should('be.visible').click();

        // * Validate if the channel has been opened
        cy.url().should('include', '/channels/town-square');

        // # Start a draft in Channel A containing just "@"
        cy.get('#post_textbox').type('@');

        // * At mention auto-complete appears in Channel A
        cy.get('#suggestionList').should('be.visible');

        // # Go to test Channel B on sidebar
        cy.get('#sidebarItem_autem-2').should('be.visible').click();

        // * Validate if the newly navigated channel is open
        // * autocomplete should not be visible in channel
        cy.url().should('include', '/channels/autem-2');
        cy.get('#suggestionList').should('not.be.visible');

        // # Start a draft in Channel B containing just "@"
        cy.get('#post_textbox').type('@');

        // * At mention auto-complete appears in Channel B
        cy.get('#suggestionList').should('be.visible');

        // # Go back to test Channel A on sidebar
        cy.get('#sidebarItem_town-square').should('be.visible').click();

        // * Validate if the channel has been opened
        // * At mention auto-complete is preserved in Channel A
        cy.url().should('include', '/channels/town-square');
        cy.get('#suggestionList').should('be.visible');
    });

    after(() => {
        // # Clear channel textbox
        cy.clearPostTextbox('town-square');
        cy.clearPostTextbox('autem-2');
    });
});

