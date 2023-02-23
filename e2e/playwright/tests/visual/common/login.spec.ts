// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test} from '@playwright/test';

import {getAdminClient} from '@e2e-support/server';
import {LoginPage} from '@e2e-support/ui/page';
import {waitForAnimationEnd} from '@e2e-support/utils';
import {matchSnapshot} from '@e2e-support/visual';

test('/login', async ({page, isMobile, browserName, viewport}, testInfo) => {
    const testArgs = {page, isMobile, browserName, viewport};
    const {adminClient} = await getAdminClient();
    const adminConfig = await adminClient.getConfig();

    // Go to login page
    const loginPage = new LoginPage(page, adminConfig);
    await loginPage.goto();
    await loginPage.toBeVisible();

    // Click to other element to remove focus from email input
    await loginPage.title.click();

    // Match snapshot of login page
    await matchSnapshot(testInfo, testArgs);

    // Click sign in button without entering user credential
    await loginPage.signInButton.click();
    await loginPage.userErrorLabel.waitFor();
    await waitForAnimationEnd(loginPage.bodyCard);

    // Match snapshot of login page with error
    await matchSnapshot({...testInfo, title: `${testInfo.title} error`}, testArgs);
});
