// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const postMessageAs = require('./post_message_as');
const postBotMessage = require('./post_bot_message');
const externalRequest = require('./external_request');
const getClipboard = require('./getClipboard');
const getRecentEmail = require('./get_recent_email');
const postIncomingWebhook = require('./post_incoming_webhook');
const oktaRequest = require('./okta_request');
const urlHealthCheck = require('./url_health_check');

module.exports = (on, config) => {
    on('task', {
        postMessageAs,
        postBotMessage,
        externalRequest,
        getClipboard,
        getRecentEmail,
        postIncomingWebhook,
        oktaRequest,
        urlHealthCheck
    });

    if (!config.env.setChromeWebSecurity) {
        config.chromeWebSecurity = false;
    }

    on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome') {
            launchOptions.args.push('--disable-notifications');
        }

        if (browser.name === 'chrome' && !config.chromeWebSecurity) {
            launchOptions.args.push('--disable-features=CrossSiteDocumentBlockingIfIsolating,CrossSiteDocumentBlockingAlways,IsolateOrigins,site-per-process');
            launchOptions.args.push('--load-extension=cypress/extensions/Ignore-X-Frame-headers');
        }

        return launchOptions;
    });

    return config;
};
