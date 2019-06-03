// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 5]*/

describe('Messaging', () => {
    before(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    // Unpin all posts at the end of the test
    after(() => {
        // pinnedPosts.forEach((pinnedPost) => {
        //     cy.apiUnpinPosts(pinnedPost);
        // });
    });

    it('M15381 - Whitespace with emojis does not affect size', () => {
        // # Post a message beginning with a new line and followed by emojis
        cy.postMessage('\n:book: :key: :gem:');

        // # Get last post message text
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).as('newLineMessage');
        });

        // * Verify message is visible and does not have a new line
        cy.get('@newLineMessage').
            should('be.visible').
            and('not.contain', '\n');

        // * Verify book emoticon size
        cy.get('@newLineMessage').
            find('span[alt=":book:"]').
            and('have.css', 'minHeight', '32px').
            and('have.css', 'minWidth', '32px');

        // * Verify key emoticon size
        cy.get('@newLineMessage').
            find('span[alt=":key:"]').
            and('have.css', 'minHeight', '32px').
            and('have.css', 'minWidth', '32px');

        // * Verify gem emoticon size
        cy.get('@newLineMessage').
            find('span[alt=":gem:"]').
            and('have.css', 'minHeight', '32px').
            and('have.css', 'minWidth', '32px');

        // # Post a message beginning with three spaces and followed by emojis
        cy.postMessage('   :book: :key: :gem:');

        // # Get last post message text
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).as('spacesMessage');
        });

        // * Verify message is visible and starts with three spaces
        cy.get('@spacesMessage').
            should('be.visible');
        cy.get('@spacesMessage').
            should((message) => {
                expect(message.find('span.all-emoji p').html()).to.match(/^[ ]{3}/);
            });

        // * Verify book emoticon size
        cy.get('@spacesMessage').
            find('span[alt=":book:"]').
            and('have.css', 'minHeight', '32px').
            and('have.css', 'minWidth', '32px');

        // * Verify key emoticon size
        cy.get('@spacesMessage').
            find('span[alt=":key:"]').
            and('have.css', 'minHeight', '32px').
            and('have.css', 'minWidth', '32px');

        // * Verify gem emoticon size
        cy.get('@spacesMessage').
            find('span[alt=":gem:"]').
            and('have.css', 'minHeight', '32px').
            and('have.css', 'minWidth', '32px');
    });
});
