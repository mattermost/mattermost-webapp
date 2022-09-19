// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Eyes, ClassicRunner, Target, CheckSettings} from '@applitools/eyes-playwright';

import testConfig, {TestArgs} from '@test.config';

export default async function openApplitoolsEyes(name: string, testArgs: TestArgs) {
    let eyes: Eyes;
    let targetWindow: CheckSettings;

    if (!testArgs.isMobile && testArgs.browserName === 'chromium' && testConfig.applitoolsEnabled) {
        if (!process.env.APPLITOOLS_API_KEY) {
            console.error('Error: API key is missing! Please set using: "export APPLITOOLS_API_KEY=<change_me>"');
        }
        const runner = new ClassicRunner();
        eyes = new Eyes(runner);
        targetWindow = Target.window().fully();

        eyes.setBranchName(testConfig.branch);
        eyes.setParentBranchName(testConfig.parentBranch);
        eyes.setAppName('webapp');
        eyes.setTestName(name);

        await eyes.open(testArgs.page);
    }

    return {eyes, targetWindow};
}
