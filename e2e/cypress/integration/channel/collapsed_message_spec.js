// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

function verifyCollapsedPost() {
    // * Verify show more button
    cy.get('#showMoreButton').scrollIntoView().should('be.visible').and('have.text', 'Show More');

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
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');

        // # Post message with kitchen sink markdown text
        cy.postMessageFromFile('long_text_post.txt');

        // # Get last post
        cy.getLastPostId().then((postId) => {
            const postMessageId = `#${postId}_message`;

            cy.get(postMessageId).within(() => {
                // * Verify collapsed post
                verifyCollapsedPost(postId);

                // # Expand the post
                cy.get('#showMoreButton').click();

                // * Verify expanded post
                verifyExpandedPost(postId);

                // # Collapse the post
                cy.get('#showMoreButton').click();

                // * Verify collapsed post
                verifyCollapsedPost(postId);
            });
        });
    });
});
