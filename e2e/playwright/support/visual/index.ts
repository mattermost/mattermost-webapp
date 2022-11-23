// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, TestInfo} from '@playwright/test';
import {CheckSettings, Eyes} from '@applitools/eyes-playwright';

import {illegalRe} from '@e2e-support/utils';
import testConfig, {TestArgs} from '@e2e-test.config';

import openApplitoolsEyes from './applitools';
import snapshotWithPercy from './percy';

export type Applitools = {
    eyes?: Eyes;
    checkSettings?: CheckSettings;
};

export async function matchSnapshot(testInfo: TestInfo, testArgs: TestArgs, applitools: Applitools = {}) {
    if (testConfig.snapshotEnabled) {
        // Visual test with built-in snapshot
        const filename = testInfo.title.replace(illegalRe, '').replace(/\s/g, '-').trim().toLowerCase();
        expect(await testArgs.page.screenshot({fullPage: true})).toMatchSnapshot(`${filename}.png`);
    }

    // This name is used to easily identify the screenshot when viewing from third-party service provider.
    const name = `[${testInfo.project.name}, ${testArgs?.viewport?.width}px] > ${testInfo.file} > ${testInfo.title}`;

    if (testConfig.percyEnabled) {
        // Visual test with Percy
        await snapshotWithPercy(name, testArgs);
    }

    let {eyes, checkSettings} = applitools;
    if (testConfig.applitoolsEnabled) {
        if (!eyes || !checkSettings) {
            ({eyes, checkSettings} = await openApplitoolsEyes(name, testArgs));
        }

        if (eyes && checkSettings) {
            // Visual test with Applitools
            await eyes?.check(name, checkSettings);
        } else {
            // log an error for debugging
            // eslint-disable-next-line no-console
            console.log('Having an issue with Applitools');
        }
    }

    return {eyes, checkSettings};
}
