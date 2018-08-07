// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

module.exports = {
    baseURL: 'https://selenium-release.storage.googleapis.com',
    version: '3.12.0',
    drivers: {
        chrome: {
            version: '2.40',
            arch: process.arch,
            baseURL: 'https://chromedriver.storage.googleapis.com',
        },
        ie: {
            version: '3.12.0',
            arch: process.arch,
            baseURL: 'https://selenium-release.storage.googleapis.com',
        },
        firefox: {
            version: '0.20.1',
            arch: process.arch,
            baseURL: 'https://github.com/mozilla/geckodriver/releases/download',
        },
        edge: {
            version: '17134',
        },
    },
};
