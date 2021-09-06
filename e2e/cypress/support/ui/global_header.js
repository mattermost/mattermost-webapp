// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetProductSwitchButton', () => {
    return cy.findByRole('button', {name: 'Select to open product switch menu.'}).should('be.visible');
});

Cypress.Commands.add('uiGetSetStatusButton', () => {
    return cy.findByRole('button', {name: 'set status'}).should('be.visible');
});

Cypress.Commands.add('uiGetStatusMenuContainer', (options = {exist: true}) => {
    if (options.exist) {
        return cy.get('#statusDropdownMenu').should('exist');
    }

    return cy.get('#statusDropdownMenu').should('not.exist');
});

Cypress.Commands.add('uiGetStatusMenu', (options = {visible: true}) => {
    if (options.visible) {
        return cy.uiGetStatusMenuContainer().find('.dropdown-menu').should('be.visible');
    }

    return cy.uiGetStatusMenuContainer().find('.dropdown-menu').should('not.be.visible');
});
