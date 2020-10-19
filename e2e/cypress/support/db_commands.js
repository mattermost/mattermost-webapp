// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const dbConfig = {
    client: Cypress.env('dbClient'),
    connection: Cypress.env('dbConnection'),
};

const message = 'Compare "cypress.json" against "config.json" of mattermost-server. It should match database driver and connection string.';

Cypress.Commands.add('apiRequireServerDBToMatch', () => {
    cy.apiGetConfig().then(({config}) => {
        expect(config.SqlSettings.DriverName, message).to.equal(Cypress.env('dbClient'));
    });
});

/**
 * Gets active sessions of a user on a given username or user ID directly from the database
 * @param {String} username
 * @param {String} userId
 * @param {String} limit - maximum number of active sessions to return, e.g. 50 (default)
 * @returns {Object} user - user object
 * @returns {[Object]} sessions - an array of active sessions
 */
Cypress.Commands.add('dbGetActiveUserSessions', ({username, userId, limit}) => {
    cy.task('dbGetActiveUserSessions', {dbConfig, params: {username, userId, limit}}).then(({user, sessions, errorMessage}) => {
        expect(errorMessage).to.be.undefined;

        cy.wrap({user, sessions});
    });
});

/**
 * Gets user on a given username directly from the database
 * @param {String} username
 * @returns {Object} user - user object
 */
Cypress.Commands.add('dbGetUser', ({username}) => {
    cy.task('dbGetUser', {dbConfig, params: {username}}).then(({user, errorMessage, error}) => {
        verifyError(error, errorMessage);

        cy.wrap({user});
    });
});

/**
 * Gets session of a user on a given session ID directly from the database
 * @param {String} sessionId
 * @returns {Object} session
 */
Cypress.Commands.add('dbGetUserSession', ({sessionId}) => {
    cy.task('dbGetUserSession', {dbConfig, params: {sessionId}}).then(({session, errorMessage}) => {
        expect(errorMessage).to.be.undefined;

        cy.wrap({session});
    });
});

/**
 * Updates session of a user on a given user ID and session ID with fields to update directly from the database
 * @param {String} sessionId
 * @param {String} userId
 * @param {Object} fieldsToUpdate - will update all except session ID and user ID
 * @returns {Object} session
 */
Cypress.Commands.add('dbUpdateUserSession', ({sessionId, userId, fieldsToUpdate}) => {
    cy.task('dbUpdateUserSession', {dbConfig, params: {sessionId, userId, fieldsToUpdate}}).then(({session, errorMessage}) => {
        expect(errorMessage).to.be.undefined;

        cy.wrap({session});
    });
});

function verifyError(error, errorMessage) {
    expect(errorMessage, `${errorMessage}\n\n${message}\n\n${JSON.stringify(error)}`).to.be.undefined;
}
