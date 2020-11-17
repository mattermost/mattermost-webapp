// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const fs = require('fs');

const path = require('path');

/**
 * Checks whether a file exist in the fixtures folder
 * @param {string} filename - filename to check if it exists
 */
module.exports = (filename) => {
    const filePath = path.resolve(__dirname, `../fixtures/${filename}`);

    return fs.existsSync(filePath);
};
