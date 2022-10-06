// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test} from '@playwright/test';
import {Eyes, CheckSettings} from '@applitools/eyes-playwright';

import {getAdminClient} from '@support/server';
import {LoginPage} from '@support/ui/page';
import {duration, wait} from '@support/utils';
import {matchSnapshot} from '@support/visual';

let eyes: Eyes;
let targetWindow: CheckSettings;

test.afterAll(async () => {
    await eyes?.close();
});

test('/login', async ({page, isMobile, browserName, viewport}, testInfo) => {
    const testArgs = {page, isMobile, browserName, viewport};
    const {adminClient} = await getAdminClient();
    const adminConfig = await adminClient.getConfig();

    // Go to login page
    const loginPage = new LoginPage(page, adminConfig);
    await loginPage.goto();

    // Wait for sign in button to be shown
    await loginPage.signInButton.waitFor();
    await wait(duration.one_sec);

    // Match snapshot of login page
    ({eyes, targetWindow} = await matchSnapshot(testInfo.title, testArgs));

    // Click sign in button without entering user credential
    await loginPage.signInButton.click();
    await loginPage.userErrorLabel.waitFor();
    await wait(duration.one_sec);

    // Match snapshot of login page with error
    await matchSnapshot(testInfo.title + ' error', testArgs, {eyes, targetWindow});
});
