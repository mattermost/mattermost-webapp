// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, TestInfo} from '@playwright/test';

import {illegalRe} from '@e2e-support/utils';
import testConfig, {TestArgs} from '@e2e-test.config';

import snapshotWithPercy from './percy';

export async function matchSnapshot(testInfo: TestInfo, testArgs: TestArgs) {
    if (testConfig.snapshotEnabled) {
        // Visual test with built-in snapshot
        const filename = testInfo.title.replace(illegalRe, '').replace(/\s/g, '-').trim().toLowerCase();
        expect(await testArgs.page.screenshot({fullPage: true})).toMatchSnapshot(`${filename}.png`);
    }

    if (testConfig.percyEnabled) {
        // Used to easily identify the screenshot when viewing from third-party service provider.
        const name = `[${testInfo.project.name}, ${testArgs?.viewport?.width}px] > ${testInfo.file} > ${testInfo.title}`;

        // Visual test with Percy
        await snapshotWithPercy(name, testArgs);
    }
}
