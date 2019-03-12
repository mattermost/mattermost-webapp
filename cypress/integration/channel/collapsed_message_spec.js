// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 5] */

function verifyCollapsedPost(postMessageTextId) {
    // * Verify HTML Content is correct
    cy.fixture('kitchenSink.html', 'utf-8').then((expectedHtml) => {
        cy.get(postMessageTextId).should('have.html', expectedHtml);
    });

    cy.get(postMessageTextId).within(() => {
        // * Verify that this is the last element that should be visible in the collapsed message
        cy.get('h3.markdown__heading').contains('Code Blocks').scrollIntoView().should('be.visible');

        // * Verify that this is the first element that should be hidden in the collapsed message
        cy.get('code').contains('This text should render in a code block').should('be.hidden');
    });

    // * Verify show more button
    cy.get('#showMoreButton').should('be.visible').and('have.text', 'Show More');

    // * Verify gradient
    cy.get('#collapseGradient').should('be.visible');
}

function verifyExpandedPost(postMessageTextId) {
    // * Verify HTML Content is correct
    cy.fixture('kitchenSink.html', 'utf-8').then((expectedHtml) => {
        cy.get(postMessageTextId).should('have.html', expectedHtml);
    });

    cy.get(postMessageTextId).within(() => {
        // * Verify that the last element to be visible when collapsed, remains visible
        cy.get('h3.markdown__heading').contains('Code Blocks').scrollIntoView().should('be.visible');

        // * Verify that the first element that was hidden, becomes visible
        cy.get('code').contains('This text should render in a code block').scrollIntoView().should('be.visible');

        // * Verify last line of post is visible to make sure it's fully expanded
        cy.get('p').contains('The end of this long post will be hidden until you choose to').scrollIntoView().should('be.visible');
    });

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
        cy.fixture('kitchenSink.md', 'utf-8').then((text) => {
            cy.get('#post_textbox').then((textbox) => {
                textbox.val(text);
            }).type(' {backspace}{enter}');
        });

        // 3. Get last post
        cy.getLastPostId().then((postId) => {
            const postMessageId = `#${postId}_message`;

            cy.get(postMessageId).within(() => {
                const postMessageTextId = `#postMessageText_${postId}`;

                // * Verify collapsed post
                verifyCollapsedPost(postMessageTextId);

                // 4. Expand the post
                cy.get('#showMoreButton').click();

                // * Verify expanded post
                verifyExpandedPost(postMessageTextId);

                // 5. Collapse the post
                cy.get('#showMoreButton').click();

                // * Verify collapsed post
                verifyCollapsedPost(postMessageTextId);
            });
        });
    });
});

