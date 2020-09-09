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
* reactToMessageAs is a task wrapped as command with post-verification
* that a reaction is added successfully to a message by a user/sender
* @param {Object} sender - a user object who will post a message
* @param {String} postId - post on which reaction is intended
* @param {String} reaction - emoji text eg. smile
*/
Cypress.Commands.add('reactToMessageAs', ({sender, postId, reaction}) => {
    const baseUrl = Cypress.config('baseUrl');

    cy.task('reactToMessageAs', {sender, postId, reaction, baseUrl}).then(({status, data}) => {
        expect(status).to.equal(200);

        // # Return the response after reaction is added
        cy.wrap({status, data});
    });
});

/**
* postIncomingWebhook is a task which is wrapped as command with post-verification
* that the incoming webhook is successfully posted
* @param {String} url - incoming webhook URL
* @param {Object} data - payload on incoming webhook
*/
Cypress.Commands.add('postIncomingWebhook', ({url, data, waitFor}) => {
    cy.task('postIncomingWebhook', {url, data}).its('status').should('be.equal', 200);

    if (!waitFor) {
        return;
    }

    cy.waitUntil(() => cy.getLastPost().then((el) => {
        switch (waitFor) {
        case 'text': {
            const textEl = el.find('.post-message__text > p')[0];
            return Boolean(textEl && textEl.textContent.includes(data.text));
        }
        case 'attachment-pretext': {
            const attachmentPretextEl = el.find('.attachment__thumb-pretext > p')[0];
            return Boolean(attachmentPretextEl && attachmentPretextEl.textContent.includes(data.attachments[0].pretext));
        }
        default:
            return false;
        }
    }));
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

    return cy.task('externalRequest', {baseUrl, user, method, path, data}).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 204]);
        return cy.wrap(response);
    });
});

/**
* postMessageAs is a task which is wrapped as command with post-verification
* that a message is successfully posted by the bot
* @param {String} message - message in a post
* @param {Object} channelId - where a post will be posted
*/
Cypress.Commands.add('postBotMessage', ({token, message, props, channelId, rootId, createAt}) => {
    const baseUrl = Cypress.config('baseUrl');

    cy.task('postBotMessage', {token, message, props, channelId, rootId, createAt, baseUrl}).then(({status, data}) => {
        expect(status).to.equal(201);

        // # Return the data so it can be interacted in a test
        cy.wrap({id: data.id, status, data});
    });
});

/**
* urlHealthCheck is a task wrapped as command that checks whether
* a URL is healthy and reachable.
* @param {String} url - URL to check
* @param {String} method - a request using a specific method
* @param {String} httpStatus - expected HTTP status
*/
Cypress.Commands.add('urlHealthCheck', ({url, method = 'get', httpStatus}) => {
    cy.task('urlHealthCheck', {url, method}).then(({data, errorCode, status, success}) => {
        expect(success, `Requires ${url} to be reachable: ${errorCode}`).to.equal(true);
        expect(status, `Expect ${httpStatus} to match returned ${status} HTTP status`).to.equal(httpStatus);

        cy.wrap({data, status});
    });
});

Cypress.Commands.add('requireWebhookServer', () => {
    const webhookBaseUrl = Cypress.env().webhookBaseUrl;
    cy.urlHealthCheck({url: webhookBaseUrl, method: 'get', httpStatus: 200});
});

Cypress.Commands.add('requireStorybookServer', () => {
    const storybookUrl = Cypress.env().storybookUrl;
    cy.urlHealthCheck({url: storybookUrl, method: 'get', httpStatus: 200});
});

Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));
