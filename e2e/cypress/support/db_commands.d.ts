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
// Custom command should follow naming convention of having `db` prefix, e.g. `dbGetUser`.
// ***************************************************************

declare namespace Cypress {
    interface Chainable<Subject = any> {

        /**
         * Gets server config, and assert if it matches with the database connection being used by Cypress
         *
         * @example
         *   cy.apiRequireServerDBToMatch();
         */
        apiRequireServerDBToMatch(): void;

        /**
         * Gets active sessions of a user on a given username or user ID directly from the database
         * @param {String} username
         * @param {String} userId
         * @param {String} limit - maximum number of active sessions to return, e.g. 50 (default)
         * @returns {Object} user - user object
         * @returns {[Object]} sessions - an array of active sessions
         */
        dbGetActiveUserSessions({username: string, userId, limit}): Chainable<Record<string, any>>;

        /**
         * Gets active sessions of a user on a given username or user ID directly from the database
         * @param {Object} options
         * @param {String} options.username
         * @param {String} options.userId
         * @param {String} options.limit - maximum number of active sessions to return, e.g. 50 (default)
         * @returns {UserProfile} user - user object
         * @returns {[Object]} sessions - an array of active sessions
         */
        dbGetActiveUserSessions(options: Record<string, any>): Chainable<Record<string, any>>;

        /**
         * Gets user on a given username directly from the database
         * @param {Object} options
         * @param {String} options.username
         * @returns {UserProfile} user - user object
         */
        dbGetUser(options: Record<string, string>): Chainable<UserProfile>;

        /**
         * Gets session of a user on a given session ID directly from the database
         * @param {Object} options
         * @param {String} options.sessionId
         * @returns {Session} session
         */
        dbGetUserSession(options: Record<string, string>): Chainable<Session>;

        /**
         * Updates session of a user on a given user ID and session ID with fields to update directly from the database
         * @param {Object} options
         * @param {String} options.sessionId
         * @param {String} options.userId
         * @param {Object} options.fieldsToUpdate - will update all except session ID and user ID
         * @returns {Session} session
         */
        dbUpdateUserSession(options: Record<string, any>): Chainable<Session>;
    }
}
