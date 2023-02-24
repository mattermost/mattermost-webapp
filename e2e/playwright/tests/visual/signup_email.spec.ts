// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test} from '@playwright/test';

import {getAdminClient} from '@e2e-support/server';
import {LoginPage, SignupPage} from '@e2e-support/ui/page';
import {duration, wait} from '@e2e-support/utils';
import {matchSnapshot} from '@e2e-support/visual';

test('/signup_email', async ({page, isMobile, browserName, viewport}, testInfo) => {
    const testArgs = {page, isMobile, browserName, viewport};
    const {adminClient} = await getAdminClient();
    const adminConfig = await adminClient?.getConfig();

    // Go to login page
    const loginPage = new LoginPage(page, adminConfig);
    await loginPage.goto();

    // Wait for sign in button to be shown
    await loginPage.signInButton.waitFor();
    await wait(duration.one_sec);

    // Create an account
    await loginPage.createAccountLink.click();
    await wait(duration.one_sec);
    await page.waitForLoadState('domcontentloaded');

    // Match snapshot of signup_email page
    await matchSnapshot(testInfo, testArgs);

    // Click sign in button without entering user credential
    const signupPage = new SignupPage(page);
    const invalidUser = {email: 'invalid', username: 'a', password: 'b'};
    await signupPage.create(invalidUser, false);
    await wait(duration.one_sec);
    await signupPage.emailError.waitFor();
    await signupPage.usernameError.waitFor();
    await signupPage.passwordError.waitFor();
    await page.waitForLoadState('domcontentloaded');

    // Match snapshot of signup_email page
    await matchSnapshot({...testInfo, title: `${testInfo.title} error`}, testArgs);
});
