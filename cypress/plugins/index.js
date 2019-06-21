// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const postMessageAs = require('./post_message_as');
const externalRequest = require('./external_request');
const getRecentEmail = require('./get_recent_email');
const getNonTeammates = require('./get_non_teammates');
const postAddTeammates = require('./post_add_teammates');

module.exports = (on) => {
    on('task', {
        postMessageAs,
        externalRequest,
        getRecentEmail,
        getNonTeammates,
        postAddTeammates,
    });

    on('before:browser:launch', (browser = {}, args) => {
        if (browser.name === 'chrome') {
            args.push('--disable-notifications');
        }

        return args;
    });
};
