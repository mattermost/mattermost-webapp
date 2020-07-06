// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// See https://github.com/applitools/eyes.sdk.javascript1/tree/master/packages/eyes-cypress#advanced-configuration

module.exports = {
    appName: 'Mattermost Webapp UI',
    accessibilityValidation: {level: 'AA', guidelinesVersion: 'WCAG_2_0'},
    batchName: 'Webapp - master (dev)',
    branch: 'master-dev',
    baselineBranch: 'master-dev',
    parentBranch: 'master-dev',
    browser: [
        {width: 1024, height: 768, name: 'chrome'},
    ],
    concurrency: 1,
    matchLevel: 'Strict',
    showLogs: false,
};
