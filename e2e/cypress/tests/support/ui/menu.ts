// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../api/types';

const SYSTEM_CONSOLE_MAIN_MENU = 'Menu Icon';

function openMenu(name: string, item: string): ChainableT<JQuery> {
    const menu = () => cy.findByRole('button', {name}).should('be.visible');

    // # Open the menu
    menu().should('be.visible').click();

    if (!item) {
        return menu();
    }

    // # Click on a particular item
    return cy.findByRole('menu').findByText(item).scrollIntoView().should('be.visible').click();
}

function getMenu(name: string) {
    return cy.findByRole('button', {name}).should('be.visible');
}

function uiOpenSystemConsoleMainMenu(item = ''): ChainableT<JQuery> {
    return openMenu(SYSTEM_CONSOLE_MAIN_MENU, item);
}
Cypress.Commands.add('uiOpenSystemConsoleMainMenu', uiOpenSystemConsoleMainMenu);

function uiCloseSystemConsoleMainMenu(): ChainableT<JQuery> {
    return cy.uiGetSystemConsoleMainMenu().click();
}
Cypress.Commands.add('uiCloseSystemConsoleMainMenu', uiCloseSystemConsoleMainMenu);

function uiGetSystemConsoleMainMenu(): ChainableT<JQuery> {
    return getMenu(SYSTEM_CONSOLE_MAIN_MENU);
}
Cypress.Commands.add('uiGetSystemConsoleMainMenu', uiGetSystemConsoleMainMenu);

function uiOpenDndStatusSubMenu(): ChainableT<JQuery> {
    cy.uiOpenUserMenu();

    // # Wait for status menu to transition in
    cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu').should('be.visible');

    // # Hover over Do Not Disturb option
    cy.get('.MenuWrapper.status-dropdown-menu .Menu__content.dropdown-menu li#status-menu-dnd_menuitem').trigger('mouseover');

    return cy.get('#status-menu-dnd');
}
Cypress.Commands.add('uiOpenDndStatusSubMenu', uiOpenDndStatusSubMenu);

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Open main menu at system console
             * @param {string} item - such as `'Switch to [Team Name]'`, `'Administrator's Guide'`, `'Troubleshooting Forum'`, `'Commercial Support'`, `'About Mattermost'` and `'Log Out'`.
             * @return the main menu
             *
             * @example
             *   cy.uiOpenSystemConsoleMainMenu();
             */
            uiOpenSystemConsoleMainMenu: typeof uiOpenSystemConsoleMainMenu;

            /**
             * Close main menu at system console
             *
             * @example
             *   cy.uiCloseSystemConsoleMainMenu();
             */
            uiCloseSystemConsoleMainMenu: typeof uiCloseSystemConsoleMainMenu;

            /**
             * Get main menu at system console
             *
             * @example
             *   cy.uiGetSystemConsoleMainMenu();
             */
            uiGetSystemConsoleMainMenu: typeof uiGetSystemConsoleMainMenu;
        }
    }
}
