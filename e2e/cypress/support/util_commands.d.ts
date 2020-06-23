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
// Custom command should follow naming convention of having `util` prefix, e.g. `utilResetTeamsAndChannels`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable<Subject = any> {

        /**
         * Creates default team if none exists
         * Deletes all non-default teams and deletes all non-default channels if fullReset is set to true
         * @param {boolean} fullReset - true (default) to reset non-default teams and channels or false to skip
         *
         * @example
         *   const fullReset = Cypress.env('resetBeforeTest');
         *   cy.utilResetTeamsAndChannels(fullReset);
         */
        utilResetTeamsAndChannels(fullReset: boolean): Chainable;
    }
}
