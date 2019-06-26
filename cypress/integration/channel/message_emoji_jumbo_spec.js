// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 4]*/

const normalSize = '21px';
const jumboSize = '32px';

const testCases = [
    {message: 'This is a normal reply with emoji :smile: {enter}', emojiSize: normalSize},
    {message: ':smile: {enter}', emojiSize: jumboSize},
    {message: ':smile: :yum: {enter}', emojiSize: jumboSize},
];

function verifyLastPostStyle(expectedSize) {
    //  * Verify size of the emoji
    cy.getLastPostId().then(() => {
        cy.get('span.emoticon').last().should('have.css', 'height', expectedSize).and('have.css', 'width', expectedSize);
    });
}

describe('Message', () => {
    it('M15011 - Emojis show as jumbo in reply thread', () => {
        // # Login and navigate to the app
        cy.apiLogin('user-1');
        cy.visit('/');

        // # Post a message
        const messageText = 'This is a test message';
        cy.postMessage(messageText);

        // # Get Last Post ID
        cy.getLastPostId().then((postId) => {
            // # Mouseover the post and click post comment icon.
            cy.clickPostCommentIcon(postId);

            testCases.forEach((testCase) => {
                // # Post a reply
                cy.postMessageReplyInRHS(testCase.message);

                // * Verify the size of the emoji
                verifyLastPostStyle(testCase.emojiSize);
            });
        });
    });
});
