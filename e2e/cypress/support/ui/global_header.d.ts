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
// Custom command should follow naming convention of having `ui` prefix, e.g. `uiGetProductSwitchButton`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable {

        /**
         * Get product switch button
         *
         * @example
         *   cy.uiGetProductSwitchButton().click();
         */
        uiGetProductSwitchButton(): Chainable;

        /**
         * Get product switch menu
         *
         * @example
         *   cy.uiGetProductSwitchMenu().click();
         */
        uiGetProductSwitchMenu(): Chainable;

        /**
         * Open product switch menu
         *
         * @param {string} item - menu item ex. System Console, Integrations, etc.
         *
         * @example
         *   cy.uiOpenProductSwitchMenu().click();
         */
        uiOpenProductSwitchMenu(item: string): Chainable;

        /**
         * Get set status button
         *
         * @example
         *   cy.uiGetSetStatusButton().click();
         */
        uiGetSetStatusButton(): Chainable;

        /**
         * Get status menu container
         *
         * @param {bool} option.exist - Set to false to not verify if the element exists. Otherwise, true (default) to check existence.
         * @example
         *   cy.uiGetStatusMenuContainer({exist: false});
         */
        uiGetStatusMenuContainer(option: Record<string, boolean>): Chainable;

        /**
         * Get user menu
         *
         * @example
         *   cy.uiGetStatusMenu();
         */
        uiGetStatusMenu(): Chainable;

        /**
         * Open user menu
         *
         * @param {string} item - menu item ex. Account Settings, Logout, etc.
         *
         * @example
         *   cy.uiOpenUserMenu();
         */
        uiOpenUserMenu(): Chainable;

        /**
         * Get settings button
         *
         * @example
         *   cy.uiGetSettingsButton();
         */
        uiGetSettingsButton(option: Record<string, boolean>): Chainable;

        /**
         * Open settings modal
         *
         * @param {string} section - ex. Display, Sidebar, etc.
         *
         * @example
         *   cy.uiOpenSettingsModal();
         */
        uiOpenSettingsModal(): Chainable;

        /**
         * User log out via user menu
         *
         * @example
         *   cy.uiLogout();
         */
        uiLogout(): Chainable;
    }
}
