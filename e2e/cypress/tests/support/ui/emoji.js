// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetEmojiPicker', () => {
    return cy.get('#emojiPicker').should('be.visible');
});

Cypress.Commands.add('uiOpenEmojiPicker', () => {
    cy.findByRole('button', {name: 'select an emoji'}).click();
    return cy.get('#emojiPicker').should('be.visible');
});

Cypress.Commands.add('uiOpenCustomEmoji', () => {
    cy.uiOpenEmojiPicker();
    cy.findByText('Custom Emoji').should('be.visible').click();

    cy.url().should('include', '/emoji');
    cy.get('.backstage-header').should('be.visible').and('contain', 'Custom Emoji');
});
