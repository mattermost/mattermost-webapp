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

        // 2. Clear channel textbox
        cy.clearPostTextbox('town-square');
        cy.clearPostTextbox('autem-2');
    });

    it('M14432 shows Autocomplete in each channel', () => {
        // 3. Go to test Channel A on sidebar
        cy.get('#sidebarItem_town-square').should('be.visible').click();

        // * Validate if the channel has been opened
        cy.url().should('include', '/channels/town-square');

        // 4. Start a draft in Channel A containing just "@"
        cy.get('#post_textbox').type('@');

        // * At mention auto-complete appears in Channel A
        cy.get('#suggestionList').should('be.visible');

        // 5. Go to test Channel B on sidebar
        cy.get('#sidebarItem_autem-2').should('be.visible').click();

        // * Validate if the newly navigated channel is open
        // * autocomplete should not be visible in channel
        cy.url().should('include', '/channels/autem-2');
        cy.get('#suggestionList').should('not.be.visible');

        // 6. Start a draft in Channel B containing just "@"
        cy.get('#post_textbox').type('@');

        // * At mention auto-complete appears in Channel B
        cy.get('#suggestionList').should('be.visible');

        // 7. Go back to test Channel A on sidebar
        cy.get('#sidebarItem_town-square').should('be.visible').click();

        // * Validate if the channel has been opened
        // * At mention auto-complete is preserved in Channel A
        cy.url().should('include', '/channels/town-square');
        cy.get('#suggestionList').should('be.visible');
    });

    after(() => {
        // 8. Clear channel textbox
        cy.clearPostTextbox('town-square');
        cy.clearPostTextbox('autem-2');
    });
});

