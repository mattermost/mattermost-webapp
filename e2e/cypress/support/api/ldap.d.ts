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
// Custom command should follow naming convention of having `api` prefix, e.g. `apiLDAPSync`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable<Subject = any> {

        /**
         * Synchronize any user attribute changes in the configured AD/LDAP server with Mattermost.
         * See https://api.mattermost.com/#tag/LDAP/paths/~1ldap~1sync/post
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         *
         * @example
         *   cy.apiLDAPSync();
         */
        apiLDAPSync(): Chainable<Response>;

        /**
         * Test the current AD/LDAP configuration to see if the AD/LDAP server can be contacted successfully.
         * See https://api.mattermost.com/#tag/LDAP/paths/~1ldap~1test/post
         * @returns {Response} response: Cypress-chainable response which should have successful HTTP status of 200 OK to continue or pass.
         *
         * @example
         *   cy.apiLDAPTest();
         */
        apiLDAPTest(): Chainable<Response>;
    }
}
