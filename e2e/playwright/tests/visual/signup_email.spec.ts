// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test, expect} from '@playwright/test';
import {Eyes, CheckSettings} from '@applitools/eyes-playwright';

import {getAdminClient} from '../../support/server';
import {LandingLoginPage, LoginPage, SignupPage} from '../../support/ui/page';
import {duration, wait} from '../../support/utils';
import {snapshotWithApplitools, snapshotWithPercy} from '../../support/visual';
import testConfig from '../../test.config';

let eyes: Eyes;

test.afterAll(async () => {
    await eyes?.close();
});

test('/signup_email', async ({page, isMobile, browserName}, testInfo) => {
    let targetWindow: CheckSettings;
    ({eyes, targetWindow} = await snapshotWithApplitools(page, isMobile, browserName, testInfo.title));

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

    await loginPage.siteNameHeader.waitFor();

    // Create an account
    await loginPage.createAccountLink.click();
    await wait(duration.one_sec);
    await page.waitForLoadState('domcontentloaded');

    // Should match login page
    if (!testConfig.percyEnabled || !testConfig.applitoolsEnabled) {
        expect(await page.screenshot({fullPage: true})).toMatchSnapshot('signup_email.png');
    }

    // Visual test with percy
    await snapshotWithPercy(page, isMobile, browserName, '/signup_email page');

    // Visual test with applitools
    await eyes?.check('/signup_email page', targetWindow);

    // Click sign in button without entering user credential
    const signupPage = new SignupPage(page, adminConfig);
    await signupPage.createAccountButton.click();
    await wait(duration.one_sec);
    await signupPage.fieldWithError.waitFor();
    await page.waitForLoadState('domcontentloaded');

    // Should match with error at login page
    if (!testConfig.percyEnabled || !testConfig.applitoolsEnabled) {
        expect(await page.screenshot({fullPage: true})).toMatchSnapshot('signup_email_error.png');
    }

    // Visual test with percy
    await snapshotWithPercy(page, isMobile, browserName, '/signup_email page with error');

    // Visual test with applitools
    await eyes?.check('/signup_email page with error', targetWindow);
});
