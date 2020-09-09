// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="cypress" />

// ***************************************************************
// Each command should be properly documented using JSDoc.
// See https://jsdoc.app/index.html for reference.
// Basic requirements for documentation are the following:
// - Meaningful description
// - Specific link to https://api.mattermost.com
// - Each parameter with `@params`
// - Return value with `@returns`
// - Example usage with `@example`
// ***************************************************************

declare namespace Cypress {
    interface Chainable<Subject = any> {

        /**
         * Adds a given reaction to a specific post from a user
         * @param {Object} reactToMessageObject - Information on person and post to which a reaction needs to be added
         * @param {Object} reactToMessageObject.sender - a user object who will post a message
         * @param {string} reactToMessageObject.postId  - post on which reaction is intended
         * @param {string} reactToMessageObject.reaction - emoji text eg. smile
         * @returns {Response} response: Cypress-chainable response
         *
         * @example
         *    cy.reactToMessageAs({sender:user2, postId:"ABC123", reaction: 'smile'});
         */
        reactToMessageAs({sender, postId, reaction}: {sender: Record<string, unknown>; postId: string; reaction: string}): Chainable<Response>;
    }
}
