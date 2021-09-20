// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetChannelFavoriteButton', () => {
    return cy.get('#toggleFavorite').should('be.visible');
});

Cypress.Commands.add('uiGetChannelMemberButton', () => {
    return cy.get('#member_popover').should('be.visible');
});

Cypress.Commands.add('uiGetChannelPinButton', () => {
    return cy.get('#channelHeaderPinButton').should('be.visible');
});

Cypress.Commands.add('uiGetChannelFileButton', () => {
    return cy.get('#channelHeaderFilesButton').should('be.visible');
});
