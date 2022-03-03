// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PlaywrightTestConfig, devices} from '@playwright/test';
import testConfig from './test.config';
import {duration} from './support/utils';

const config: PlaywrightTestConfig = {
    globalSetup: require.resolve('./global_setup'),
    forbidOnly: !!process.env.CI,
    outputDir: './test-results',
    retries: 1,
    testDir: 'tests',
    timeout: duration.one_min,
    workers: process.env.CI ? 2 : 1,
    use: {
        baseURL: testConfig.baseURL,
        headless: true,
        locale: 'en-US',
        screenshot: 'only-on-failure',
        timezoneId: 'America/Los_Angeles',
        trace: 'off',
        video: 'on-first-retry',
    },
    projects: [
        {
            name: 'iphone',
            use: {
                browserName: 'chromium',
                ...devices['iPhone 13 Pro'],
            },
        },
        {
            name: 'ipad',
            use: {
                browserName: 'chromium',
                ...devices['iPad Pro 11'],
            },
        },
        {
            name: 'chrome',
            use: {
                browserName: 'chromium',
                permissions: ['notifications'],
                viewport: {width: 1280, height: 1024},
            },
        },
        {
            name: 'firefox',
            use: {
                browserName: 'firefox',
                permissions: ['notifications'],
                viewport: {width: 1280, height: 1024},
            },
        },
    ],
};

export default config;
