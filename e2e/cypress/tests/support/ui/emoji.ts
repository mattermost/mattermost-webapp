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

function uiOpenCustomEmoji() {
    cy.uiOpenEmojiPicker();
    cy.findByText('Custom Emoji').should('be.visible').click();

    cy.url().should('include', '/emoji');
    cy.get('.backstage-header').should('be.visible').and('contain', 'Custom Emoji');
}
Cypress.Commands.add('uiOpenCustomEmoji', uiOpenCustomEmoji);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Open custom emoji
             *
             * @example
             *   cy.uiOpenCustomEmoji();
             */
            uiOpenCustomEmoji(): ChainableT<void>;

            uiGetEmojiPicker: typeof uiGetEmojiPicker;
            uiOpenEmojiPicker: typeof uiOpenEmojiPicker;
        }
    }
}
