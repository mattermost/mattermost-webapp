// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Eyes, ClassicRunner, Target} from '@applitools/eyes-playwright';

import testConfig, {TestArgs} from '@e2e-test.config';
import {Applitools} from '.';

export default async function openApplitoolsEyes(name: string, testArgs: TestArgs) {
    const applitools: Applitools = {};

    if (!testArgs.isMobile && testArgs.browserName === 'chromium' && testConfig.applitoolsEnabled) {
        if (!process.env.APPLITOOLS_API_KEY) {
            // eslint-disable-next-line no-console
            console.error('Error: API key is missing! Please set using: "export APPLITOOLS_API_KEY=<change_me>"');
        }
        const runner = new ClassicRunner();
        const eyes = new Eyes(runner);

        applitools.eyes = eyes;
        applitools.checkSettings = Target.window().fully();

        eyes.setBranchName(testConfig.branch);
        eyes.setParentBranchName(testConfig.parentBranch);
        eyes.setAppName('webapp');
        eyes.setTestName(name);

        // Ignore since applitools is using Playwright.Page
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await eyes.open(testArgs.page);
    }

    return applitools;
}
