// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../types';

const dbClient = Cypress.env('dbClient');
const dbConnection = Cypress.env('dbConnection');
const dbConfig = {
    client: dbClient,
    connection: dbConnection,
};

const message = `Compare "cypress.json" against "config.json" of mattermost-server. It should match database driver and connection string.

The value at "cypress.json" is based on default mattermost-server's local database: 
{"dbClient": "${dbClient}", "dbConnection": "${dbConnection}"}

If your server is using database other than the default, you may export those as env variables, like:
"__CYPRESS_dbClient=[dbClient] CYPRESS_dbConnection=[dbConnection] npm run cypress:open__"
`;

function apiRequireServerDBToMatch(): ChainableT {
    return cy.apiGetConfig().then(({config}) => {
        // On Cloud, SqlSettings is not being returned.
        // With that, checking of server DB will be ignored and will assume it does match with
        // the one being expected by Cypress.
        if (config.SqlSettings && config.SqlSettings.DriverName !== dbClient) {
            expect(config.SqlSettings.DriverName, message).to.equal(dbClient);
        }
    });
}
Cypress.Commands.add('apiRequireServerDBToMatch', apiRequireServerDBToMatch);

/**
 * Gets active sessions of a user on a given username or user ID directly from the database
 * @param {String} username
 * @param {String} userId
 * @param {String} limit - maximum number of active sessions to return, e.g. 50 (default)
 * @returns {Object} user - user object
 * @returns {[Object]} sessions - an array of active sessions
 */
function dbGetActiveUserSessions({username, userId, limit}): ChainableT<{user: Record<string, any>; sessions: Array<Record<string, any>>}> {
    return cy.task('dbGetActiveUserSessions', {dbConfig, params: {username, userId, limit}}).then(({user, sessions, errorMessage}) => {
        expect(errorMessage).to.be.undefined;

        return cy.wrap({user, sessions});
    });
}
Cypress.Commands.add('dbGetActiveUserSessions', dbGetActiveUserSessions);

/**
 * Gets user on a given username directly from the database
 * @param {String} username
 * @returns {Object} user - user object
 */
function dbGetUser({username}): ChainableT<{user: Record<string, any>}> {
    return cy.task('dbGetUser', {dbConfig, params: {username}}).then(({user, errorMessage, error}) => {
        verifyError(error, errorMessage);

        return cy.wrap({user});
    });
}
Cypress.Commands.add('dbGetUser', dbGetUser);

/**
 * Gets session of a user on a given session ID directly from the database
 * @param {String} sessionId
 * @returns {Object} session
 */
function dbGetUserSession({sessionId}): ChainableT<{session: Record<string, any>}> {
    return cy.task('dbGetUserSession', {dbConfig, params: {sessionId}}).then(({session, errorMessage}) => {
        expect(errorMessage).to.be.undefined;

        return cy.wrap({session});
    });
}
Cypress.Commands.add('dbGetUserSession', dbGetUserSession);

/**
 * Updates session of a user on a given user ID and session ID with fields to update directly from the database
 * @param {String} sessionId
 * @param {String} userId
 * @param {Object} fieldsToUpdate - will update all except session ID and user ID
 * @returns {Object} session
 */
function dbUpdateUserSession({sessionId, userId, fieldsToUpdate}): ChainableT<{session: Record<string, any>}> {
    return cy.task('dbUpdateUserSession', {dbConfig, params: {sessionId, userId, fieldsToUpdate}}).then(({session, errorMessage}) => {
        expect(errorMessage).to.be.undefined;

        return cy.wrap({session});
    });
}
Cypress.Commands.add('dbUpdateUserSession', dbUpdateUserSession);

function verifyError(error, errorMessage) {
    if (errorMessage) {
        expect(errorMessage, `${errorMessage}\n\n${message}\n\n${JSON.stringify(error)}`).to.be.undefined;
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Gets server config, and assert if it matches with the database connection being used by Cypress
             *
             * @example
             *   cy.apiRequireServerDBToMatch();
             */
            apiRequireServerDBToMatch(): Chainable;

            /**
             * Gets active sessions of a user on a given username or user ID directly from the database
             * @param {String} username
             * @param {String} userId
             * @param {String} limit - maximum number of active sessions to return, e.g. 50 (default)
             * @returns {Object} user - user object
             * @returns {[Object]} sessions - an array of active sessions
             */
            dbGetActiveUserSessions(options: {
                username: string;
                userId?: string;
                limit?: number;
            }): Chainable<{user: Record<string, any>; sessions: Array<Record<string, any>>}>;

            /**
             * Gets user on a given username directly from the database
             * @param {Object} options
             * @param {String} options.username
             * @returns {UserProfile} user - user object
             */
            dbGetUser(options: {username: string}): Chainable<{user: Record<string, any>}>;

            /**
             * Gets session of a user on a given session ID directly from the database
             * @param {Object} options
             * @param {String} options.sessionId
             * @returns {Session} session
             */
            dbGetUserSession(options: {sessionId: string}): Chainable<{session: Record<string, any>}>;

            /**
             * Updates session of a user on a given user ID and session ID with fields to update directly from the database
             * @param {Object} options
             * @param {String} options.sessionId
             * @param {String} options.userId
             * @param {Object} options.fieldsToUpdate - will update all except session ID and user ID
             * @returns {Session} session
             */
            dbUpdateUserSession(options: {
                sessionId: string;
                userId: string;
                fieldsToUpdate: Record<string, any>;
            }): Chainable<{session: Record<string, any>}>;
        }
    }
}
