// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Page} from '@playwright/test';
import {Eyes, ClassicRunner, Target, CheckSettings} from '@applitools/eyes-playwright';

import testConfig from '../../test.config';

export default async function snapshotWithApplitools(page: Page, isMobile: boolean, browserName: string, name: string) {
    let eyes: Eyes;
    let targetWindow: CheckSettings;

    if (!isMobile && browserName === 'chromium' && testConfig.applitoolsEnabled) {
        if (!process.env.APPLITOOLS_API_KEY) {
            console.error('Error: API key is missing! Please set using: "export APPLITOOLS_API_KEY=<change_me>"');
        }
        const runner = new ClassicRunner();
        eyes = new Eyes(runner);
        targetWindow = Target.window().fully();

        eyes.setBranchName(process.env.BRANCH);
        eyes.setAppName('webapp');
        eyes.setTestName(name);

        await eyes.open(page);
    }

    return {eyes, targetWindow};
}
