// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect} from '@playwright/test';
import {CheckSettings, Eyes} from '@applitools/eyes-playwright';

import {illegalRe} from '@support/utils';
import testConfig, {TestArgs} from '@test.config';

import openApplitoolsEyes from './applitools';
import snapshotWithPercy from './percy';

type ApplitoolsOption = {
    eyes?: Eyes;
    targetWindow?: CheckSettings;
};

export async function matchSnapshot(name: string, testArgs: TestArgs, applitoolsOption: ApplitoolsOption = {}) {
    if (testConfig.snapshotEnabled) {
        // Visual test with built-in snapshot
        const filename = name.replace(illegalRe, '').replace(/\s/g, '-').trim().toLowerCase();
        expect(await testArgs.page.screenshot({fullPage: true})).toMatchSnapshot(`${filename}.png`);
    }

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
