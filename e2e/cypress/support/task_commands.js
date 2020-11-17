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
* @param {String} name - name of service to check
* @param {String} url - URL to check
* @param {String} helperMessage - a message to display on error to help resolve the issue
* @param {String} method - a request using a specific method
* @param {String} httpStatus - expected HTTP status
*/
Cypress.Commands.add('urlHealthCheck', ({name, url, helperMessage, method, httpStatus}) => {
    Cypress.log({name, message: `Checking URL health at ${url}`});

    cy.task('urlHealthCheck', {url, method}).then(({data, errorCode, status, success}) => {
        const urlService = `__${name}__ at ${url}`;

        const successMessage = success ?
            `${urlService}: reachable` :
            `${errorCode}: The test you're running requires ${urlService} to be reachable. \n${helperMessage}`;
        expect(success, successMessage).to.equal(true);

        const statusMessage = status === httpStatus ?
            `${urlService}: responded with ${status} HTTP status` :
            `${urlService}: expected to respond with ${httpStatus} but got ${status} HTTP status`;
        expect(status, statusMessage).to.equal(httpStatus);

        cy.wrap({data, status});
    });
});

Cypress.Commands.add('requireWebhookServer', () => {
    const webhookBaseUrl = Cypress.env().webhookBaseUrl;
    const helperMessage = `
__Tips:__
    1. In local development, you may run "__npm run start:webhook__" at "/e2e" folder.
    2. If reachable from remote host, you may export it as env variable, like "__CYPRESS_webhookBaseUrl=[url] npm run cypress:open__".
`;

    cy.urlHealthCheck({
        name: 'Webhook Server',
        url: webhookBaseUrl,
        helperMessage,
        method: 'get',
        httpStatus: 200,
    });
});

Cypress.Commands.add('requireStorybookServer', () => {
    const storybookUrl = Cypress.env().storybookUrl;
    const helperMessage = `
__Tips:__
    1. In local development, you may run "__npm run storybook__" at root folder.
    2. If reachable from remote host, you may export it as env variable, like "__CYPRESS_storybookUrl=[url] npm run cypress:open__".
`;

    cy.urlHealthCheck({
        name: 'Storybook Server',
        url: storybookUrl,
        helperMessage,
        method: 'get',
        httpStatus: 200,
    });
});

Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));
