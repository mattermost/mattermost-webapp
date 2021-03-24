// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const MAIN_MENU = 'main menu';
const CHANNEL_MENU = 'channel menu';
const SET_STATUS_MENU = 'set status';

function openMenu(name, item) {
    const menu = () => cy.findByRole('button', {name}).should('be.visible');

    // # Open the menu
    menu().should('be.visible').click();

    if (!item) {
        return menu();
    }

    // # Click on a particular item
    return cy.findByRole('menu').findByText(item).scrollIntoView().should('be.visible').click();
}

function getMenu(name) {
    return cy.findByRole('button', {name}).should('be.visible');
}

Cypress.Commands.add('uiOpenMainMenu', (item = '') => {
    return openMenu(MAIN_MENU, item);
});

Cypress.Commands.add('uiCloseMainMenu', () => {
    return cy.uiGetMainMenu().click();
});

Cypress.Commands.add('uiGetMainMenu', () => {
    return getMenu(MAIN_MENU);
});

Cypress.Commands.add('uiOpenChannelMenu', (item = '') => {
    return openMenu(CHANNEL_MENU, item);
});

Cypress.Commands.add('uiCloseChannelMenu', () => {
    return cy.uiGetChannelMenu().click();
});

Cypress.Commands.add('uiGetChannelMenu', () => {
    return getMenu(CHANNEL_MENU);
});

Cypress.Commands.add('uiOpenSetStatusMenu', (item = '') => {
    return openMenu(SET_STATUS_MENU, item);
});
