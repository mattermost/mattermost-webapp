// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const fs = require('fs');

const pdf = require('pdf-parse');

/**
 * Checks whether a file exist in the fixtures folder
 * @param {string} filename - filename to check if it exists
 */
module.exports = async (pdfPathName) => {
    const dataBuffer = fs.readFileSync(pdfPathName);
    const data = await pdf(dataBuffer);
    return data;
};
