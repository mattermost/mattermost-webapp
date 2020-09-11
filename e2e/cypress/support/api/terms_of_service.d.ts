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
// Custom command should follow naming convention of having `api` prefix, e.g. `apiLogin`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable<Subject = any> {

        /**
         * Create a new terms of service.
         * See https://api.mattermost.com/#tag/terms-of-service/paths/~1terms_of_service/post
         * @param {String} text - Terms of service text, displayed when a user logs in for the first time after a new one has been created.
         *
         * @example
         *   cy.apiCreateTermsOfService('Accept me').then(({termsOfService}) => {
         *       // do something
         *   });
         */
        apiCreateTermsOfService(text: string): Chainable<TermsOfService>;
    }
}
