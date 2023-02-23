// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, test} from '@playwright/test';

import {getAdminClient} from '@e2e-support/server';
import {LoginPage, SignupPage} from '@e2e-support/ui/page';
import {waitForAnimationEnd} from '@e2e-support/utils';
import {matchSnapshot} from '@e2e-support/visual';

test('/signup_email', async ({page, isMobile, browserName, viewport}, testInfo) => {
    const testArgs = {page, isMobile, browserName, viewport};
    const {adminClient} = await getAdminClient();
    const adminConfig = await adminClient.getConfig();

    // Go to login page
    const loginPage = new LoginPage(page, adminConfig);
    await loginPage.goto();
    await loginPage.toBeVisible();

    // Create an account
    await loginPage.createAccountLink.click();

    // Should have redirected to signup page
    const signupPage = new SignupPage(page);
    await signupPage.toBeVisible();

    // Click to other element to remove focus from email input
    await signupPage.title.click();

    // Match snapshot of signup_email page
    await matchSnapshot(testInfo, testArgs);

    // Click sign in button without entering user credential
    const invalidUser = {email: 'invalid', username: 'a', password: 'b'};
    await signupPage.create(invalidUser, false);
    await signupPage.emailError.waitFor();
    await signupPage.usernameError.waitFor();
    await signupPage.passwordError.waitFor();
    await waitForAnimationEnd(signupPage.bodyCard);

    // Match snapshot of signup_email page
    await matchSnapshot({...testInfo, title: `${testInfo.title} error`}, testArgs);
});
