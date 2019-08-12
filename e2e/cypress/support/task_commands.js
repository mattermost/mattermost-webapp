// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
* postMessageAs is a task which is wrapped as command with post-verification
* that a message is successfully posted by the user/sender
* @param {Object} sender - a user object who will post a message
* @param {String} message - message in a post
* @param {Object} channelId - where a post will be posted
*/
Cypress.Commands.add('postMessageAs', ({sender, message, channelId, rootId, createAt}) => {
    const baseUrl = Cypress.config('baseUrl');

    cy.task('postMessageAs', {sender, message, channelId, rootId, createAt, baseUrl}).then(({status, data}) => {
        expect(status).to.equal(201);

        // # Return the data so it can be interacted in a test
        cy.wrap({id: data.id, status, data});
    });
});

/**
* postIncomingWebhook is a task which is wrapped as command with post-verification
* that the incoming webhook is successfully posted
* @param {String} url - incoming webhook URL
* @param {Object} data - payload on incoming webhook
*/
Cypress.Commands.add('postIncomingWebhook', ({url, data}) => {
    cy.task('postIncomingWebhook', {url, data}).its('status').should('be.equal', 200);
});

/**
* externalRequest is a task which is wrapped as command with post-verification
* that the external request is successfully completed
* @param {Object} user - a user initiating external request
* @param {String} method - an HTTP method (e.g. get, post, etc)
* @param {String} path - API path that is relative to Cypress.config().baseUrl
* @param {Object} data - payload
*/
Cypress.Commands.add('externalRequest', ({user, method, path, data}) => {
    const baseUrl = Cypress.config('baseUrl');

    cy.task('externalRequest', {baseUrl, user, method, path, data}).its('status').should('be.equal', 200);
});
