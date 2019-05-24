// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 4] */

describe('Message Draft with attachment and Switch Channels', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M14126 Message Draft Pencil Icon - No text, only file attachment', () => {
        // # Got to a test channel on the side bar
        cy.get('#sidebarItem_town-square').scrollIntoView();
        cy.get('#sidebarItem_town-square').should('be.visible').click();

        // * Validate if the channel has been opened
        cy.url().should('include', '/channels/town-square');

        // * Validate if the draft icon is not visible on the sidebar before making a draft
        cy.get('#sidebarItem_town-square').scrollIntoView();
        cy.get('#sidebarItem_town-square #draftIcon').should('be.not.visible');

        // Attach image in text area
        cy.fixture('mattermost-icon.png').then((fileContent) => {
            cy.get('#fileUploadButton input').upload(
                {fileContent, fileName: 'mattermost-icon.png', mimeType: 'image/png'},
                {subjectType: 'drag-n-drop'},
            );
        });

        // # Go to another test channel without submitting the draft in the previous channel
        cy.get('#sidebarItem_off-topic').scrollIntoView();
        cy.get('#sidebarItem_off-topic').should('be.visible').click();

        // * Validate if the newly navigated channel is open
        cy.url().should('include', '/channels/off-topic');

        // * Validate if the draft icon is visible on side bar on the previous channel with a draft
        cy.get('#sidebarItem_town-square #draftIcon').should('be.visible');
    });
});
