// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test, expect} from '@playwright/test';
import {Eyes, CheckSettings} from '@applitools/eyes-playwright';

import {getAdminClient} from '../../support/server';
import {LandingLoginPage, LoginPage} from '../../support/ui/page';
import {duration, wait} from '../../support/utils';
import {snapshotWithApplitools, snapshotWithPercy} from '../../support/visual';
import testConfig from '../../test.config';

let eyes: Eyes;

test.afterAll(async () => {
    await eyes?.close();
});

test('/login', async ({page, isMobile, browserName}, testInfo) => {
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

    // Should match default login page
    await loginPage.siteNameHeader.waitFor();
    await wait(duration.one_sec);
    if (!testConfig.percyEnabled || !testConfig.applitoolsEnabled) {
        expect(await page.screenshot({fullPage: true})).toMatchSnapshot('login.png');
    }

    // Visual test with percy
    await snapshotWithPercy(page, isMobile, browserName, '/login page');

    // Visual test with applitools
    await eyes?.check('/login page', targetWindow);

    // Click sign in button without entering user credential
    await loginPage.signInButton.click();
    await loginPage.userErrorLabel.waitFor();
    await wait(duration.one_sec);

    // Should match with error at login page
    if (!testConfig.percyEnabled || !testConfig.applitoolsEnabled) {
        expect(await page.screenshot({fullPage: true})).toMatchSnapshot('login_error.png');
    }

    // Visual test with percy
    await snapshotWithPercy(page, isMobile, browserName, '/login page with error');

    // Visual test with applitools
    await eyes?.check('/login page with error', targetWindow);
});
