// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const clipboardy = require('clipboardy');

module.exports = async () => {
    return clipboardy.readSync();
};
