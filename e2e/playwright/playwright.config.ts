// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PlaywrightTestConfig, devices} from '@playwright/test';

import {duration} from '@support/utils';
import testConfig from '@test.config';

const config: PlaywrightTestConfig = {
    globalSetup: require.resolve('./global_setup'),
    forbidOnly: !!process.env.CI,
    outputDir: './test-results',
    retries: 1,
    testDir: 'tests',
    timeout: duration.one_min,
    workers: process.env.CI && process.env.PW_WORKERS ? parseInt(process.env.PW_WORKERS, 10) : 1,
    expect: {
        toMatchSnapshot: {
            threshold: 0.4,
            maxDiffPixelRatio: 0.0001,
        },
    },
    use: {
        baseURL: testConfig.baseURL,
        headless: true,
        locale: 'en-US',
        screenshot: 'only-on-failure',
        timezoneId: 'America/Los_Angeles',
        trace: 'off',
        video: 'on-first-retry',
        actionTimeout: duration.ten_sec,
        storageState: {
            cookies: [],
            origins: [
                {
                    origin: testConfig.baseURL,
                    localStorage: [{name: '__landingPageSeen__', value: 'true'}],
                },
            ],
        },
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
    reporter: [
        ['html', {open: 'never'}],
        ['json', {outputFile: 'playwright-report/results.json'}],
        ['junit', {outputFile: 'playwright-report/results.xml'}],
        ['list'],
    ],
};

export default config;
