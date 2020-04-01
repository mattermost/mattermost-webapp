// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @search

describe('Search', () => {
    it('S14548 Search results Right-Hand-Side: Post a comment', () => {
        // # Login and navigate to the app
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        const message = `asparagus${Date.now()}`;
        const comment = 'Replying to asparagus';

        // # Post a new message
        cy.postMessage(message);

        // # Search for the text we just entered
        cy.get('#searchBox').type(message).type('{enter}');

        // # Get last postId
        cy.getLastPostId().then((postId) => {
            const postMessageText = `#rhsPostMessageText_${postId}`;

            // * Search results should have our original message
            cy.get('#search-items-container').find(postMessageText).should('have.text', `${message}`);

            // # Click on the reply button on the search result
            cy.clickPostCommentIcon(postId, 'SEARCH');

            // # Reply with a comment
            cy.get('#reply_textbox').type(`${comment}{enter}`);

            // * Verify sidebar is still open
            cy.get('#rhsContainer').should('be.visible');

            // * Verify that the original message is in the RHS
            cy.get('#rhsContainer').find(postMessageText).should('have.text', `${message}`);
        });

        // # Get the comment id
        cy.getLastPostId().then((commentId) => {
            const rhsCommentText = `#rhsPostMessageText_${commentId}`;
            const mainCommentText = `#postMessageText_${commentId}`;

            // * Verify comment in RHS
            cy.get('#rhsContainer').find(rhsCommentText).should('have.text', `${comment}`);

            // * Verify comment main thread
            cy.get('#postListContent').find(mainCommentText).should('have.text', `${comment}`);
        });
    });
});
