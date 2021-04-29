// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

const {
    dbGetActiveUserSessions,
    dbGetUser,
    dbGetUserSession,
    dbUpdateUserSession,
} = require('./db_request');
const clientRequest = require('./client_request');
const externalRequest = require('./external_request');
const fileExist = require('./file_exist');
const getRecentEmail = require('./get_recent_email');
const keycloakRequest = require('./keycloak_request');
const oktaRequest = require('./okta_request');
const postBotMessage = require('./post_bot_message');
const postIncomingWebhook = require('./post_incoming_webhook');
const postMessageAs = require('./post_message_as');
const urlHealthCheck = require('./url_health_check');
const reactToMessageAs = require('./react_to_message_as');

const log = (message) => {
    console.log(message);
    return null;
};

module.exports = (on, config) => {
    on('task', {
        clientRequest,
        dbGetActiveUserSessions,
        dbGetUser,
        dbGetUserSession,
        dbUpdateUserSession,
        externalRequest,
        fileExist,
        getRecentEmail,
        keycloakRequest,
        log,
        oktaRequest,
        postBotMessage,
        postIncomingWebhook,
        postMessageAs,
        urlHealthCheck,
        reactToMessageAs,
    });

    on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome' && !config.chromeWebSecurity) {
            launchOptions.args.push('--disable-features=CrossSiteDocumentBlockingIfIsolating,CrossSiteDocumentBlockingAlways,IsolateOrigins,site-per-process');
            launchOptions.args.push('--load-extension=cypress/extensions/Ignore-X-Frame-headers');
        }

        return launchOptions;
    });

    return config;
};
