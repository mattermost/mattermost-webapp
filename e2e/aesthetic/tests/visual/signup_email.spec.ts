// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test, expect} from '@playwright/test';
import percySnapshot from '@percy/playwright';

import {getAdminClient} from '../../support/server/init';
import {LandingLoginPage, LoginPage, SignupPage} from '../../support/ui/page';
import {duration, wait} from '../../support/utils';
import testConfig from '../../test.config';

test('/signup_email', async ({page, isMobile, browserName}) => {
    const {adminClient} = await getAdminClient();
    const adminConfig = await adminClient.getConfig();

    // Go to login page
    const loginPage = new LoginPage(page, adminConfig);
    await loginPage.goto();

    if (isMobile) {
        // Click view in browser
        const landingLoginPage = new LandingLoginPage(page);
        await landingLoginPage.viewInBrowserButton.click();
    }

    expect(await loginPage.siteNameHeader).toBeVisible();

    // Create an account
    await loginPage.createAccountLink.click();
    await wait(duration.one_sec);

    // Should match login page
    expect(await page.screenshot({fullPage: true})).toMatchSnapshot('signup_email.png');

    // Visual test with percy
    if (!isMobile && browserName === 'chromium' && testConfig.percyEnabled) {
        await percySnapshot(page, '/signup_email page');
    }

    // Click sign in button without entering user credential
    const signupPage = new SignupPage(page, adminConfig);
    await signupPage.createAccountButton.click();
    await wait(duration.one_sec);
    await signupPage.fieldWithError.waitFor();
    await page.waitForLoadState('domcontentloaded');

    // Should match with error at login page
    expect(await page.screenshot({fullPage: true})).toMatchSnapshot('signup_email_error.png');

    // Visual test with percy
    if (!isMobile && browserName === 'chromium' && testConfig.percyEnabled) {
        await percySnapshot(page, '/signup_email page with error');
    }
});
