// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const postMessageAs = require('./post_message_as');
const postBotMessage = require('./post_bot_message');
const externalRequest = require('./external_request');
const getRecentEmail = require('./get_recent_email');
const postIncomingWebhook = require('./post_incoming_webhook');
const cleanupConfigFolder = require('./clean_up_config_folder');

module.exports = (on, config) => {
    on('task', {
        postMessageAs,
        postBotMessage,
        externalRequest,
        getRecentEmail,
        postIncomingWebhook,
        cleanupConfigFolder
    });

    if(config.env.turnOffChromeWebSecurity) {
        config.chromeWebSecurity = false;
    }

    on('before:browser:launch', (browser = {}, args) => {
        if (browser.name === 'chrome') {
            args.push('--disable-notifications');
        }

        args.push("--disable-features=CrossSiteDocumentBlockingIfIsolating,CrossSiteDocumentBlockingAlways,IsolateOrigins,site-per-process");
        args.push("--load-extension=cypress/extensions/Ignore-X-Frame-headers_v1.1");

        return args;
    });

    return config;
};
