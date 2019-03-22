// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Message Draft and Switch Channels', () => {
    before(() => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');
    });

    it('M14358 Message Draft Pencil Icon Visible in Channel Switcher', () => {
        // 1. In a test channel, type some text in the message input box
        // 2. Do not send the post
        cy.get('#sidebarItem_town-square').scrollIntoView();
        cy.get('#sidebarItem_town-square').should('be.visible').click();

        // * Validate if the channel has been opened
        cy.url().should('include', '/channels/town-square');

        // * Validate if the draft icon is not visible on the sidebar before making a draft
        cy.get('#sidebarItem_town-square').scrollIntoView();
        cy.get('#sidebarItem_town-square #draftIcon').should('be.not.visible');

        // Type in some text into the text area of the opened channel
        cy.get('#post_textbox').type('message draft test');

        // 3. Switch to another channel
        cy.get('#sidebarItem_autem-2').scrollIntoView();
        cy.get('#sidebarItem_autem-2').should('be.visible').click();

        //* Validate if the newly navigated channel is open
        cy.url().should('include', '/channels/autem-2');

        // 4. Press CTRL/CMD+K
        cy.typeCmdOrCtrl().type('K', {release: true});

        //* Click on hint in modal to get out of overlapping suggestion list
        cy.get('#quickSwitchHint').click();

        // 5. Type the first few letters of the channel name you typed the message draft in
        cy.get('#quickSwitchInput').type('tow');
        cy.wait(500);  // eslint-disable-line

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        //* Validate if the draft icon is visible to left of the channel name in the filtered list
        cy.get('#switchChannel_town-square #draftIcon').should('be.visible');

        //* Escape channel switcher and reset post textbox for test channel
        cy.get('.close').click();
        cy.clearPostTextbox('town-square');
    });
});

