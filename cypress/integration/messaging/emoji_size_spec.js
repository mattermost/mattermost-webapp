// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 5]*/

function checkEmojiSize(message, emojis) {
    emojis.forEach((emoji) => {
        cy.get(message).
            find('span[alt="' + emoji + '"]').
            and('have.css', 'minHeight', '32px').
            and('have.css', 'minWidth', '32px');
    });
}

describe('Messaging', () => {
    before(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M15381 - Whitespace with emojis does not affect size', () => {
        const emojis = [':book:', ':key:', ':gem:'];

        // # Post a message beginning with a new line and followed by emojis
        cy.postMessage('\n' + emojis.join(' '));

        // # Get last post message text
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).as('newLineMessage');
        });

        // * Verify message is visible and does not have a new line
        cy.get('@newLineMessage').
            should('be.visible').
            and('not.contain', '\n');

        // * Verify emoji size
        checkEmojiSize('@newLineMessage', emojis);

        // # Post a message beginning with three spaces and followed by emojis
        cy.postMessage('   ' + emojis.join(' '));

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

        // * Verify emoji size
        checkEmojiSize('@spacesMessage', emojis);
    });
});