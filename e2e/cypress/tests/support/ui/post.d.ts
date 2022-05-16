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
// Custom command should follow naming convention of having `ui` prefix, e.g. `uiGetPostHeader`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable {

        /**
         * Get post profile image of a given post ID or the last post if post ID is not given
         *
         * @param {string} - postId (optional)
         *
         * @example
         *   cy.uiGetPostProfileImage();
         */
        uiGetPostProfileImage(postId: string): Chainable;

        /**
         * Get post header of a given post ID or the last post if post ID is not given
         *
         * @param {string} - postId (optional)
         *
         * @example
         *   cy.uiGetPostHeader();
         */
        uiGetPostHeader(postId: string): Chainable;

        /**
         * Get post body of a given post ID or the last post if post ID is not given
         *
         * @param {string} - postId (optional)
         *
         * @example
         *   cy.uiGetPostBody();
         */
        uiGetPostBody(postId: string): Chainable;

        /**
         * Get post thread footer of a given post ID or the last post if post ID is not given
         *
         * @param {string} - postId (optional)
         *
         * @example
         *   cy.uiGetPostThreadFooter();
         */
        uiGetPostThreadFooter(postId: string): Chainable;

        /**
         * Get post embed container of a given post ID or the last post if post ID is not given
         *
         * @param {string} - postId (optional)
         *
         * @example
         *   cy.uiGetPostEmbedContainer();
         */
        uiGetPostEmbedContainer(postId: string): Chainable;
    }
}
