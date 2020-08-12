// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

function verifyCollapsedPost() {
    // * Verify show more button
    cy.get('#showMoreButton').scrollIntoView().should('be.visible').and('have.text', 'Show more');

    // * Verify gradient
    cy.get('#collapseGradient').should('be.visible');
}

function verifyExpandedPost() {
    // * Verify show more button now says 'Show less'
    cy.get('#showMoreButton').scrollIntoView().should('be.visible').and('have.text', 'Show less');

    // * Verify gradient
    cy.get('#collapseGradient').should('be.not.visible');
}

describe('Long message', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T104 Can `Show More` and `Show Less` on long posts, Markdown in long posts', () => {
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
