// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, TestInfo} from '@playwright/test';
import {CheckSettings, Eyes} from '@applitools/eyes-playwright';

import {illegalRe} from '@support/utils';
import testConfig, {TestArgs} from '@test.config';

import openApplitoolsEyes from './applitools';
import snapshotWithPercy from './percy';

type ApplitoolsOption = {
    eyes?: Eyes;
    targetWindow?: CheckSettings;
};

export async function matchSnapshot(testInfo: TestInfo, testArgs: TestArgs, applitoolsOption: ApplitoolsOption = {}) {
    if (testConfig.snapshotEnabled) {
        // Visual test with built-in snapshot
        const filename = testInfo.title.replace(illegalRe, '').replace(/\s/g, '-').trim().toLowerCase();
        expect(await testArgs.page.screenshot({fullPage: true})).toMatchSnapshot(`${filename}.png`);
    }

    // This name is used to easily identify the screenshot when viewing from third-party service provider.
    const name = `[${testInfo.project.name}, ${testArgs.viewport.width}px] > ${testInfo.file} > ${testInfo.title}`;

    if (testConfig.percyEnabled) {
        // Visual test with Percy
        await snapshotWithPercy(name, testArgs);
    }

    let {eyes, targetWindow} = applitoolsOption;
    if (testConfig.applitoolsEnabled) {
        if (!eyes || !targetWindow) {
            ({eyes, targetWindow} = await openApplitoolsEyes(name, testArgs));
        }

        // Visual test with Applitools
        await eyes?.check(name, targetWindow);
    }

    return {eyes, targetWindow};
}
