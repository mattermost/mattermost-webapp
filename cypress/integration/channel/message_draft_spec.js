// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Message Draft', () => {
    before(() => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');
    });

    it('M13473 Message Draft - Pencil Icon', () => {
        // 1. Got to a test channel on the side bar
        cy.get('#sidebarItem_town-square').scrollIntoView();
        cy.get('#sidebarItem_town-square').should('be.visible').click();

        // * Validate if the channel has been opened
        cy.url().should('include', '/ad-1/channels/town-square');

        // * Validate if the draft icon is not visible on the sidebar before making a draft
        cy.get('#sidebarItem_town-square').scrollIntoView();
        cy.get('#sidebarItem_town-square #draftIcon').should('be.not.visible');

        //2. Type in some text into the text area of the opened channel
        cy.get('#post_textbox').type('comm');

        //3. Go to another test channel without submitting the draft in the previous channel
        cy.get('#sidebarItem_ratione-1').scrollIntoView();
        cy.get('#sidebarItem_ratione-1').should('be.visible').click();

        //* Validate if the newly navigated channel is open
        cy.url().should('include', '/ad-1/channels/ratione-1');

        //* Validate if the draft icon is visible on side bar on the previous channel with a draft
        cy.get('#sidebarItem_town-square #draftIcon').should('be.visible');
    });
});
