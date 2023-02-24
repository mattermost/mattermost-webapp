// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {defineConfig, devices} from '@playwright/test';

import {duration} from '@e2e-support/utils';
import testConfig from '@e2e-test.config';

const defaultOutputFolder = 'playwright-report';

export default defineConfig({
    globalSetup: require.resolve('./global_setup'),
    forbidOnly: testConfig.isCI,
    outputDir: './test-results',
    retries: 1,
    testDir: 'tests',
    timeout: duration.one_min,
    workers: testConfig.workers,
    expect: {
        toMatchSnapshot: {
            threshold: 0.4,
            maxDiffPixelRatio: 0.0001,
        },
    },
    use: {
        baseURL: testConfig.baseURL,
        headless: testConfig.headless,
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
        ['html', {open: 'never', outputFolder: defaultOutputFolder}],
        ['json', {outputFile: `${defaultOutputFolder}/results.json`}],
        ['junit', {outputFile: `${defaultOutputFolder}/results.xml`}],
        ['list'],
    ],
});
