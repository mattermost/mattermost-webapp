// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [number] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Permalink message edit', () => {
    it('M18717 - Edit a message in permalink view', () => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        const searchWord = `searchtest ${Date.now()}`;

        // # Post message
        cy.postMessage(searchWord);

        // # Search for searchWord
        cy.get('#searchBox').type(searchWord).type('{enter}');

        // # Jump to permalink view
        cy.get('.search-item__jump').first().click();

        cy.getLastPostId().then((postId) => {
            // # Click on ... button of last post matching the searchWord
            cy.clickPostDotMenu(postId);

            // # Click on edit post
            cy.get(`#edit_post_${postId}`).click();

            const editedText = `edited - ${searchWord}`;

            // # Add new text in edit box
            cy.get('#edit_textbox').clear().type(editedText);

            // # Click edit button
            cy.get('#editButton').click();

            // # Check edited post
            verifyEditedPermalink(postId, editedText);

            // # Login as "user-2" and go to /
            cy.apiLogin('user-2');
            cy.visit('/');

            // # Find searchWord and verify edited post
            cy.get('#searchBox').type(searchWord).type('{enter}');
            cy.get('.search-item__jump').first().click();
            verifyEditedPermalink(postId, editedText);
        });
    });
    function verifyEditedPermalink(postId, text) {
        // * Check that it redirected to permalink URL
        cy.url().should('include', `/ad-1/pl/${postId}`);

        // * Verify edited post
        cy.get(`#postMessageText_${postId}`).should('have.text', text);
        cy.get(`#postEdited_${postId}`).should('have.text', '(edited)');
    }
});
