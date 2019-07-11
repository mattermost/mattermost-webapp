// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************
describe('Filtered emojis are sorted by recency, then begins with, then contains', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
        cy.clearLocalStorage(/recent_emojis/);
    });

    it('should order emoji by recency', async () => {
        // #Post a dog emoji
        cy.postMessage(':dog:');

        // #Post a cat emoji
        cy.postMessage(':cat:');

        // #Open emoji picker
        cy.get('#emojiPickerButton').click();

        // #Assert first recently used emoji has the id of the last emoji we sent (:cat: with id: emoji-1f431)
        cy.assertLastUsedEmojiHasId('emoji-1f431');
    });

    it('should order recently used emoji first in alphabetical order, Followed by emoji that contain "word" in alphabetical', async () => {
        // #Post a guardsman emoji
        cy.postMessage(':guardsman:');

        // #Post a white small square emoji
        cy.postMessage(':white_small_square:');

        // #Open emoji picker
        cy.get('#emojiPickerButton').click();

        // #Search in emoji input the text: sma
        cy.get('emoji-picker__search').type('sma');
    });
});
