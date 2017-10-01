// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

module.exports = {
    baseURL: "https://selenium-release.storage.googleapis.com",
    version: "3.4.0",
    drivers: {
        chrome: {
            version: "2.31",
            arch: process.arch,
            baseURL: "https://chromedriver.storage.googleapis.com"
        },
        ie: {
            version: '3.4.0',
            arch: process.arch,
            baseURL: 'https://selenium-release.storage.googleapis.com'
        },
        firefox: {
            version: '0.17.0',
            arch: process.arch,
            baseURL: 'https://github.com/mozilla/geckodriver/releases/download'
        },
        edge: {
            version: '15063'
        }
    }
};
