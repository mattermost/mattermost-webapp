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
// Custom command should follow naming convention of having `ui` prefix, e.g. `uiOpenFilePreview`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable {

        /**
         * Get file thumbnail from a post
         *
         * @example
         *   cy.uiGetFileThumbnail('image.png');
         */
        uiGetFileThumbnail(filename: string): Chainable;

        /**
         * Get file preview modal
         *
         * @example
         *   cy.uiGetFilePreview();
         */
        uiGetFilePreview(): Chainable;

        /**
         * Open file preview modal
         *
         * @param {string} filename
         *
         * @example
         *   cy.uiOpenFilePreview('image.png');
         */
        uiOpenFilePreview(filename: string): Chainable;

        /**
         * Close file preview modal
         *
         * @example
         *   cy.uiCloseFilePreview();
         */
        uiCloseFilePreview(filename: string): Chainable;
    }
}
