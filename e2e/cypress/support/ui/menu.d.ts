// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="cypress" />

// ***************************************************************
// Each command should be properly documented using JSDoc.
// See https://jsdoc.app/index.html for reference.
// Basic requirements for documentation are the following:
// - Meaningful description
// - Each parameter with `@params`
// - Return value with `@returns`
// - Example usage with `@example`
// Custom command should follow naming convention of having `ui` prefix, e.g. `uiOpenMainMenu`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable {

        /**
         * Open the main menu
         * @param {string} item - such as `'Account Settings'`, `'Invite People'`, `'Team Settings'` and other items in the main menu.
         * @return the main menu
         *
         * @example
         *   cy.uiOpenMainMenu();
         */
        uiOpenMainMenu(): Chainable;

        /**
         * Close the main menu
         *
         * @example
         *   cy.uiCloseMainMenu();
         */
        uiCloseMainMenu(): Chainable;

        /**
         * Get the main menu
         *
         * @example
         *   cy.uiGetMainMenu();
         */
        uiGetMainMenu(): Chainable;

        /**
         * Open the main menu
         * @param {string} item - such as `'View Info'`, `'Notification Preferences'`, `'Team Settings'` and other items in the main menu.
         * @return the main menu
         *
         * @example
         *   cy.uiOpenChannelMenu();
         */
        uiOpenChannelMenu(): Chainable;

        /**
         * Close the channel menu
         *
         * @example
         *   cy.uiCloseChannelMenu();
         */
        uiCloseChannelMenu(): Chainable;

        /**
         * Get the channel menu
         *
         * @example
         *   cy.uiGetChannelMenu();
         */
        uiGetChannelMenu(): Chainable;

        /**
         * Set Status
         * @param {string} item - such as `'Online'`,`'Set a Custom Status'`, `'Away'`, `'Do Not Disturb'` and `'Offline'`
         *
         * @example
         *   uiOpenSetStatusMenu(item);
         */
        uiOpenSetStatusMenu(item): Chainable;
    }
}
