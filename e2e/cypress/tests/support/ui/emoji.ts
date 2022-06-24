// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

function uiGetEmojiPicker(): ChainableT<JQuery> {
    return cy.get('#emojiPicker').should('be.visible');
}
Cypress.Commands.add('uiGetEmojiPicker', uiGetEmojiPicker);

function uiOpenEmojiPicker(): ChainableT<JQuery> {
    cy.findByRole('button', {name: 'select an emoji'}).click();
    return cy.get('#emojiPicker').should('be.visible');
}
Cypress.Commands.add('uiOpenEmojiPicker', uiOpenEmojiPicker);

function uiOpenCustomEmoji(): ChainableT<void> {
    cy.uiOpenEmojiPicker();
    cy.findByText('Custom Emoji').should('be.visible').click();

    cy.url().should('include', '/emoji');
    cy.get('.backstage-header').should('be.visible').and('contain', 'Custom Emoji');
    return
}
Cypress.Commands.add('uiOpenCustomEmoji', uiOpenCustomEmoji);

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * Open custom emoji
             *
             * @example
             *   cy.uiOpenCustomEmoji();
             */
            uiOpenCustomEmoji: typeof uiOpenCustomEmoji;

            uiGetEmojiPicker: typeof uiGetEmojiPicker;
            uiOpenEmojiPicker: typeof uiOpenEmojiPicker;
        }
    }
}
