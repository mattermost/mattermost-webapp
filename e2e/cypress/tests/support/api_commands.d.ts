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
// Custom command should follow naming convention of having `ui` prefix, e.g. `uiWaitUntilMessagePostedIncludes`.
// ***************************************************************

interface LDAPSyncResponse {
    status: number;
    body: {status: string, last_activity_at: number}[]
}

export {}

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Wait for a message to get posted as the last post.
             * @returns {string} returns true if found or fail a test if not.
             *
             * @example
             *   cy.getCurrentUserId().then((id) => {
             */
            apiGetLDAPSync(): Chainable<LDAPSyncResponse>
        }
    }
}
