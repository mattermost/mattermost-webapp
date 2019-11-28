// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const postMessageAs = require('./post_message_as');
const externalRequest = require('./external_request');
const getRecentEmail = require('./get_recent_email');
const postIncomingWebhook = require('./post_incoming_webhook');

module.exports = (on, config) => {
    on('task', {
        postMessageAs,
        externalRequest,
        getRecentEmail,
        postIncomingWebhook,
    });

    on('before:browser:launch', (browser = {}, args) => {
        if (browser.name === 'chrome') {
            args.push('--disable-notifications');
        }

        return args;
    });

    return config;
};
