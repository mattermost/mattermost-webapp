// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test} from '@playwright/test';

import {getAdminClient} from '@e2e-support/server';
import {LoginPage} from '@e2e-support/ui/page';
import {duration, wait} from '@e2e-support/utils';
import {matchSnapshot, Applitools} from '@e2e-support/visual';

let applitools: Applitools = {};

test.afterAll(async () => {
    await applitools.eyes?.close();
});

test('/login', async ({page, isMobile, browserName, viewport}, testInfo) => {
    const testArgs = {page, isMobile, browserName, viewport};
    const {adminClient} = await getAdminClient();
    const adminConfig = await adminClient?.getConfig();

    // Go to login page
    const loginPage = new LoginPage(page, adminConfig);
    await loginPage.goto();

    // Wait for sign in button to be shown
    await loginPage.signInButton.waitFor();
    await wait(duration.one_sec);

    // Match snapshot of login page
    applitools = await matchSnapshot(testInfo, testArgs);

    // Click sign in button without entering user credential
    await loginPage.signInButton.click();
    await loginPage.userErrorLabel.waitFor();
    await wait(duration.one_sec);

    // Match snapshot of login page with error
    await matchSnapshot({...testInfo, title: `${testInfo.title} error`}, testArgs, applitools);
});
