// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 4]*/

function verifyLastPostStyle(expectedSize) {
    //  * Verify text sizes
    cy.getLastPostId().then(() => {
        cy.get('span.emoticon').last().should('have.css', 'height', expectedSize).and('have.css', 'width', expectedSize);
    });
}

describe('Message', () => {
    it('M15011 - Emojis show as jumbo in reply thread', () => {
        // # Login and navigate to the app
        cy.apiLogin('user-1');
        cy.visit('/');

        const comment1 = 'This is a normal reply with emoji :smile: {enter}';
        const comment2 = ':smile: {enter}';
        const comment3 = ':smile: :yum: {enter}';
        const normalSize = '21px';
        const jumboSize = '32px';

        // # Post a message
        const messageText = 'This is a test message';
        cy.postMessage(messageText);

        // # Get Last Post ID
        cy.getLastPostId().then(() => {
            // # Mouseover the post and click post comment icon.
            cy.clickPostCommentIcon();

            // # Post a reply with text and emoji
            cy.postMessageReplyInRHS(comment1);

            // * Verify the size of the emoji is normal size
            verifyLastPostStyle(normalSize);

            // # Post a reply with single emoji
            cy.postMessageReplyInRHS(comment2);

            // * Verify the size of the emoji is jumbo size
            verifyLastPostStyle(jumboSize);

            // # Post a reply with multiple emojis
            cy.postMessageReplyInRHS(comment3);

            // * Verify the size of the emoji is jumbo size
            verifyLastPostStyle(jumboSize);
        });
    });
});
