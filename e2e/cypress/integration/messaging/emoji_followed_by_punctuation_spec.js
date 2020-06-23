// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

function emojiVerification(postId) {
    // # set the postMessageTextId var
    const postMessageTextId = `#postMessageText_${postId}`;

    // * Check for the emoji attr of :) is exists
    cy.get(`${postMessageTextId} p span span.emoticon`).should('have.attr', 'title', ':slightly_smiling_face:');

    // * Check for the punctuation('=') is exists without space
    cy.get(`${postMessageTextId} p`).should('same.text', ':slightly_smiling_face:=');
}

describe('Messaging', () => {
    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('M23360 - Emoji characters followed by punctuation', () => {
        // # Post a message
        const messageText = ':)=';
        cy.postMessage(messageText);

        // # Get Last Post ID
        cy.getLastPostId().then((postId) => {
            emojiVerification(postId);
        });
    });
});
