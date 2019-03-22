// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 5] */

function verifyCollapsedPost() {
    // * Verify show more button
    cy.get('#showMoreButton').should('be.visible').and('have.text', 'Show More');

    // * Verify gradient
    cy.get('#collapseGradient').should('be.visible');
}

function verifyExpandedPost() {
    // * Verify show more button now says 'Show Less'
    cy.get('#showMoreButton').scrollIntoView().should('be.visible').and('have.text', 'Show Less');

    // * Verify gradient
    cy.get('#collapseGradient').should('be.not.visible');
}

describe('Long message', () => {
    it('M14321 will show more/less content correctly', () => {
        // 1. Login as "user-1" and go to /
        cy.login('user-1');
        cy.visit('/');

        // 2. Post message with kitchen sink markdown text
        cy.postMessageFromFile('long_text_post.txt');

        // 3. Get last post
        cy.getLastPostIdWithRetry().then((postId) => {
            const postMessageId = `#${postId}_message`;

            cy.get(postMessageId).within(() => {
                // * Verify collapsed post
                verifyCollapsedPost(postId);

                // 4. Expand the post
                cy.get('#showMoreButton').click();

                // * Verify expanded post
                verifyExpandedPost(postId);

                // 5. Collapse the post
                cy.get('#showMoreButton').click();

                // * Verify collapsed post
                verifyCollapsedPost(postId);
            });
        });
    });
});
