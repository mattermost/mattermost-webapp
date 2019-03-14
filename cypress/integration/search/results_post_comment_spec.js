// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 3]*/

describe('Search', () => {
    it('S14548 Search results Right-Hand-Side: Post a comment', () => {
        // 1. Login and navigate to the app
        cy.login('user-1');
        cy.visit('/');

        const message = `asparagus-${Date.now()}`;
        const comment = 'Replying to asparagus';

        // 2. Post a new message
        cy.postMessage(message);

        // 3. Search for the text we just entered
        cy.get('#searchBox').type(message).type('{enter}');

        // 4. Get last postId
        cy.getLastPostId().then((postId) => {
            const postMessageText = `#postMessageText_${postId}`;

            // * Search results should have our original message
            cy.get('#search-items-container').find(postMessageText).should('have.text', `${message}\n`);

            // 5. Click on the reply button on the search result
            cy.clickPostCommentIcon(postId, 'SEARCH');

            // 6. Reply with a comment
            cy.get('#reply_textbox').type(`${comment}{enter}`);

            // * Verify sidebar is still open
            cy.get('#rhsContainer').should('be.visible');

            // * Verify that the original message is in the RHS
            cy.get('#rhsContainer').find(postMessageText).should('have.text', `${message}\n`);
        });

        // 7. Get the comment id
        cy.getLastPostId().then((commentId) => {
            const commentText = `#postMessageText_${commentId}`;

            // * Verify comment in RHS
            cy.get('#rhsContainer').find(commentText).should('have.text', `${comment}\n`);

            // * Verify comment main thread
            cy.get('#postListContent').find(commentText).should('have.text', `${comment}\n`);
        });
    });
});