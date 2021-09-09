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
        uiGetStatusMenuContainer(): Chainable;

        /**
         * Get status menu
         *
         * @param {bool} option.visible - Set to false to not verify if the element is visible. Otherwise, true (default) to check visibility.
         * @example
         *   cy.uiGetStatusMenu();
         */
        uiGetStatusMenu(): Chainable;
    }
}
