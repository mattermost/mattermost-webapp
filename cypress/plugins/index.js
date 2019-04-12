// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const postMessageAs = require('./post_message_as');
const externalRequest = require('./external_request');

module.exports = (on) => {
    on('task', {
        postMessageAs,
        externalRequest,
    });
};