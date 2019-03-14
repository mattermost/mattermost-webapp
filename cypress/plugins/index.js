// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const postMessageAs = require('./postMessageAs');

module.exports = (on) => {
    on('task', {
        postMessageAs,
    });
};