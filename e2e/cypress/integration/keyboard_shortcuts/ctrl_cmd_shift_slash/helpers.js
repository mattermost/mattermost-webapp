// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TIMEOUTS from '../../../fixtures/timeouts';

/**
 * Fires off keyboard shortcut for "React to last message"
 * @param {String} from CENTER, RHS or body if not provided.
 */
export function doReactToLastMessageShortcut(from) {
    if (from === 'CENTER') {
        cy.get('#post_textbox').
            focus().
            clear().
            cmdOrCtrlShortcut('{shift}\\');
    } else if (from === 'RHS') {
        cy.get('#reply_textbox').
            focus().
            clear().
            cmdOrCtrlShortcut('{shift}\\');
    } else {
        cy.get('body').cmdOrCtrlShortcut('{shift}\\');
    }
    cy.wait(TIMEOUTS.HALF_SEC);
}

/**
 * Click "smile" emoji from the emoji picker
 */
export function clickSmileEmojiFromEmojiPicker() {
    // * Check that emoji picker is opened.
    cy.get('#emojiPicker').
        should('be.visible').
        within(() => {
            // # Search for an emoji and click
            cy.findByPlaceholderText('Search emojis').type('smile').wait(TIMEOUTS.HALF_SEC);
            cy.findAllByTestId('emojiItem').findByRole('button', {name: 'smile emoji'}).should('exist').click({force: true});
        });
    cy.wait(TIMEOUTS.HALF_SEC);
}

/**
 * Check if 'smile' reaction was added to a post
 * @param {String} postId Post ID of the message
 */
export function checkReactionFromPost(postId) {
    if (postId) {
        cy.get(`#${postId}_message`).within(() => {
            cy.findByLabelText('reactions').should('exist');
            cy.findByLabelText('remove reaction smile').should('exist');
        });
    } else {
        cy.findByLabelText('reactions').should('exist');
        cy.findByLabelText('remove reaction smile').should('exist');
    }
}

export function pressEscapeKey() {
    cy.get('body').type('{esc}');
}
