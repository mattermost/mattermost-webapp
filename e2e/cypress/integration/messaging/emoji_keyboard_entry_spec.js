// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [number] indicates a test step (e.g. 1. Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Message', () => {
    beforeEach(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M16738 Use keyboard navigation in emoji picker', () => {
        // # Open emoji picker
        cy.get('#emojiPickerButton').click();

        // # Wait for emojis to load
        cy.get('#emojiPicker').should('be.visible');

        // # Randomize directional arrow inputs
        const min = 1;
        const max = 5;
        for (const direction of ['right', 'down', 'up']) {
            const pressCount = Math.floor(Math.random() * max) + min;

            for (let i = 0; i < pressCount; i += 1) {
                cy.get('#emojiPickerSearch').type(`{${direction}arrow}`);
            }
        }

        cy.get('.emoji-picker__preview-image-label-box .emoji-picker__preview-aliases').invoke('text').then((selectedEmoji) => {
            // # Select chosen emoji
            cy.get('#emojiPickerSearch').type('{enter}');

            // # Post message with keyboard
            cy.get('#post_textbox').type('{enter}');

            // # Compare selected emoji with last post
            cy.getLastPost().find('.emoticon').should('have.attr', 'title', selectedEmoji);
        });
    });
});
