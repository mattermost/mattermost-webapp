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
// Custom command should follow naming convention of having `external` prefix, e.g. `externalAddUserToTeam`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable<Subject = any> {

        /**
         * Makes an external request as a sysadmin and adds a user to a team directly via API
         * @param {String} teamId - The team ID
         * @param {String} userId - The user ID
         * All parameter required
         *
         * @example
         *   cy.externalAddUserToTeam('team-id', 'user-id');
         */
        externalAddUserToTeam(teamId: string, userId: string): Chainable;
    }
}
