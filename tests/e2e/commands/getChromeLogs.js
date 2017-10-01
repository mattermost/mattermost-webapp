// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

exports.command = function getChromeLogs() {
    return this.getLog('browser', (logEntriesArray) => {
        logEntriesArray.forEach((log) => {
            console.log(`[${log.level}] Timestamp: ${log.timestamp}\n`); //eslint-disable-line no-console
        });
    });
};
