// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {AxiosResponse, Method} from 'axios';

import {Post} from '@mattermost/types/posts';

import {ChainableT} from './api/types';

interface PostMessageResponse{
    id: string;
    status: number;
    data: any;
}
function postMessageAs({sender, message, channelId, rootId, createAt}): ChainableT<PostMessageResponse> {
    const baseUrl = Cypress.config('baseUrl');

    return cy.task('postMessageAs', {sender, message, channelId, rootId, createAt, baseUrl}).then((response: AxiosResponse<{id: string}>) => {
        const {status, data} = response
        expect(status).to.equal(201);

        // # Return the data so it can be interacted in a test
        return cy.wrap({id: data.id, status, data});
    });
}
Cypress.Commands.add('postMessageAs', postMessageAs);

type PostListOfMessagesArg = {
    numberOfMessages?: number;
    sender: {
        username: string;
        password: string;
    };
    message: string;
    channelId: string;
}
function postListOfMessages(arg: PostListOfMessagesArg): ChainableT<any> {
    const {numberOfMessages = 30, ...rest} = arg;
    const baseUrl = Cypress.config('baseUrl');

    return cy.
        task('postListOfMessages', {numberOfMessages, baseUrl, ...rest}, {timeout: numberOfMessages * 200}).
        each((message: {status: number}) => expect(message.status).to.equal(201));
}
Cypress.Commands.add('postListOfMessages', postListOfMessages);

interface ReactToMessageAsArg {
    sender: {
        id: string;
        username: string;
        password: string;
    };
    postId: string;
    reaction: string;
}
function reactToMessageAs(arg: ReactToMessageAsArg): ChainableT<Pick<AxiosResponse<any>, 'status' | 'data'>> {
    const {sender, postId, reaction} = arg;
    const baseUrl = Cypress.config('baseUrl');

    return cy.task('reactToMessageAs', {sender, postId, reaction, baseUrl}).then((response: AxiosResponse<any>) => {
        const {status, data} = response;
        expect(status).to.equal(200);

        // # Return the response after reaction is added
        return cy.wrap({status, data});
    });
}
Cypress.Commands.add('reactToMessageAs', reactToMessageAs);

function postIncomingWebhook({url, data, waitFor}: {url: string, data: any; waitFor: string}): ChainableT<void> {
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
    return;
}
Cypress.Commands.add('postIncomingWebhook', postIncomingWebhook);

interface ExternalRequestArg<T> {
    user: {
    };
    method: Method;
    path: string;
    data?: T;
    failOnStatusCode?: boolean;
}
function externalRequest<T=any, U=any>(arg: ExternalRequestArg<U>): ChainableT<Pick<AxiosResponse<T>, 'data' | 'status'>> {
    const {user, method, path, data, failOnStatusCode = true} = arg;
    const baseUrl = Cypress.config('baseUrl');

    return cy.task('externalRequest', {baseUrl, user, method, path, data}).then((response: Pick<AxiosResponse<T & {id: string}>, 'data' | 'status'>) => {
        // Temporarily ignore error related to Cloud
        const cloudErrorId = [
            'ent.cloud.request_error',
            'api.cloud.get_subscription.error',
        ];

        if (response.data && !cloudErrorId.includes(response.data.id) && failOnStatusCode) {
            expect(response.status).to.be.oneOf([200, 201, 204]);
        }

        return cy.wrap(response);
    });
}
Cypress.Commands.add('externalRequest', externalRequest);

interface PostBotMessageArg {
    token: string;
    message: string;
    props: Record<string, any>
    channelId: string;
    rootId: string;
    createAt: number;
    failOnStatus: boolean;
}
function postBotMessage(arg: PostBotMessageArg): ChainableT<{status: number; data: Post; id: string}> {
    const {token, message, props, channelId, rootId, createAt, failOnStatus = true} = arg;
    const baseUrl = Cypress.config('baseUrl');

    return cy.task('postBotMessage', {token, message, props, channelId, rootId, createAt, baseUrl}).then((response: AxiosResponse<Post>) => {
        const {status, data} = response;
        if (failOnStatus) {
            expect(status).to.equal(201);
        }

        // # Return the data so it can be interacted in a test
        return cy.wrap({id: data.id, status, data});
    });
}
Cypress.Commands.add('postBotMessage', postBotMessage);

interface UrlHealthCheckArg {
    name: string;
    url: string;
    helperMessage: string;
    method: string;
    httpStatus: number;
}
function urlHealthCheck(arg: UrlHealthCheckArg): ChainableT<{data: any; status: number;}> {
    const {name, url, helperMessage, method, httpStatus} = arg;
    Cypress.log({name, message: `Checking URL health at ${url}`});

    return cy.task('urlHealthCheck', {url, method}).then(({data, errorCode, status, success}) => {
        const urlService = `__${name}__ at ${url}`;

        const successMessage = success ?
            `${urlService}: reachable` :
            `${errorCode}: The test you're running requires ${urlService} to be reachable. \n${helperMessage}`;
        expect(success, successMessage).to.equal(true);

        const statusMessage = status === httpStatus ?
            `${urlService}: responded with ${status} HTTP status` :
            `${urlService}: expected to respond with ${httpStatus} but got ${status} HTTP status`;
        expect(status, statusMessage).to.equal(httpStatus);

        return cy.wrap({data, status});
    });
}
Cypress.Commands.add('urlHealthCheck', urlHealthCheck);

function requireWebhookServer(): ChainableT<any> {
    const baseUrl = Cypress.config('baseUrl');
    const webhookBaseUrl = Cypress.env('webhookBaseUrl');
    const adminUsername = Cypress.env('adminUsername');
    const adminPassword = Cypress.env('adminPassword');
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

    cy.task('postIncomingWebhook', {
        url: `${webhookBaseUrl}/setup`,
        data: {
            baseUrl,
            webhookBaseUrl,
            adminUsername,
            adminPassword,
        }}).
        its('status').should('be.equal', 201);

    return;
}
Cypress.Commands.add('requireWebhookServer', requireWebhookServer);

Cypress.Commands.overwrite('log', (_subject, message) => cy.task('log', message));

declare global {
    namespace Cypress {
        interface Chainable {

            /**
             * externalRequest is a task which is wrapped as command with post-verification
             * that the external request is successfully completed
             * @param {Object} options
             * @param {<UserProfile, 'username' | 'password'>} options.user - a user initiating external request
             * @param {String} options.method - an HTTP method (e.g. get, post, etc)
             * @param {String} options.path - API path that is relative to Cypress.config().baseUrl
             * @param {Object} options.data - payload
             * @param {string} options.baseUrl - base URL
             * @param {Boolean} options.failOnStatusCode - whether to fail on status code, default is true
             *
             * @example
             *    cy.externalRequest({user: sysadmin, method: 'POST', path: 'config', data});
             */
            externalRequest: typeof externalRequest;

            /**
             * Adds a given reaction to a specific post from a user
             * reactToMessageAs is a task wrapped as command with post-verification
             * that a reaction is added successfully to a message by a user/sender
             * @param {Object} reactToMessageObject - Information on person and post to which a reaction needs to be added
             * @param {Object} reactToMessageObject.sender - a user object who will post a message
             * @param {string} reactToMessageObject.postId  - post on which reaction is intended
             * @param {string} reactToMessageObject.reaction - emoji text eg. smile
             * @returns {Response} response: Cypress-chainable response
             *
             * @example
             *    cy.reactToMessageAs({sender:user2, postId:"ABC123", reaction: 'smile'});
             */
            reactToMessageAs: typeof reactToMessageAs

            /**
             * Verify that the webhook server is accessible, and then sets up base URLs and credential.
             *
             * @example
             *    cy.requireWebhookServer();
             */
            requireWebhookServer: typeof requireWebhookServer;

            /**
            * postMessageAs is a task which is wrapped as command with post-verification
            * that a message is successfully posted by the user/sender
            * @param {Object} sender - a user object who will post a message
            * @param {String} message - message in a post
            * @param {Object} channelId - where a post will be posted
            */
            postMessageAs: typeof postMessageAs;

            /**
             * @param {string} [numberOfMessages = 30] - Number of messages
             * @param {Object} sender - a user object who will post a message
             * @param {String} message - message in a post
             * @param {Object} channelId - where a post will be posted
             */
            postListOfMessages: typeof postListOfMessages;

            /**
            * postIncomingWebhook is a task which is wrapped as command with post-verification
            * that the incoming webhook is successfully posted
            * @param {String} url - incoming webhook URL
            * @param {Object} data - payload on incoming webhook
            */
            postIncomingWebhook: typeof postIncomingWebhook;

            /**
            * postBotMessage is a task which is wrapped as command with post-verification
            * that a message is successfully posted by the bot
            * @param {String} message - message in a post
            * @param {Object} channelId - where a post will be posted
            */
            postBotMessage: typeof postBotMessage;

            /**
            * urlHealthCheck is a task wrapped as command that checks whether
            * a URL is healthy and reachable.
            * @param {String} name - name of service to check
            * @param {String} url - URL to check
            * @param {String} helperMessage - a message to display on error to help resolve the issue
            * @param {String} method - a request using a specific method
            * @param {Number} httpStatus - expected HTTP status
            */
            urlHealthCheck: typeof urlHealthCheck;
        }
    }
}
