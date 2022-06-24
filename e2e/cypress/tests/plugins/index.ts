// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

import clientRequest from './client_request';
import {
    dbGetActiveUserSessions,
    dbGetUser,
    dbGetUserSession,
    dbUpdateUserSession,
} from './db_request';
import externalRequest from './external_request';
import {fileExist, writeToFile} from './file_util';
import getPdfContent from './get_pdf_content';
import getRecentEmail from './get_recent_email';
import keycloakRequest from './keycloak_request';
import oktaRequest from './okta_request';
import postBotMessage from './post_bot_message';
import postIncomingWebhook from './post_incoming_webhook';
import postMessageAs from './post_message_as';
import postListOfMessages from './post_list_of_messages';
import reactToMessageAs from './react_to_message_as';
import {
    shellFind,
    shellRm,
    shellUnzip,
} from './shell';
import urlHealthCheck from './url_health_check';

const log = (message: string) => {
    console.log(message);
    return null;
};

export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
    on('task', {
        clientRequest,
        dbGetActiveUserSessions,
        dbGetUser,
        dbGetUserSession,
        dbUpdateUserSession,
        externalRequest,
        fileExist,
        writeToFile,
        getPdfContent,
        getRecentEmail,
        keycloakRequest,
        log,
        oktaRequest,
        postBotMessage,
        postIncomingWebhook,
        postMessageAs,
        postListOfMessages,
        urlHealthCheck,
        reactToMessageAs,
        shellFind,
        shellRm,
        shellUnzip,
    });

    on('before:browser:launch', (browser: Cypress.Browser = ({} as Cypress.Browser), launchOptions: Cypress.BrowserLaunchOptions) => {
        if (browser.name === 'chrome' && !config.chromeWebSecurity) {
            launchOptions.args.push('--disable-features=CrossSiteDocumentBlockingIfIsolating,CrossSiteDocumentBlockingAlways,IsolateOrigins,site-per-process');
            launchOptions.args.push('--load-extension=tests/extensions/Ignore-X-Frame-headers');
        }

        if (browser.family === 'chromium' && browser.name !== 'electron') {
            launchOptions.args.push('--disable-dev-shm-usage');
        }

        return launchOptions;
    });

    return config;
};
