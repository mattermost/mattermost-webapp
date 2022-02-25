// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test, expect} from '@playwright/test';

import {getAdminClient} from '../../support/server/init';
import {LandingLoginPage, LoginPage} from '../../support/ui/page';
import {duration, wait} from '../../support/utils';

test('/login', async ({page, isMobile}) => {
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
    expect(await page.screenshot({fullPage: true})).toMatchSnapshot('login.png');

    // Click sign in button without entering user credential
    await loginPage.signInButton.click();
    await loginPage.userErrorLabel.waitFor();
    await wait(duration.one_sec);

    // Should match with error at login page
    expect(await page.screenshot({fullPage: true})).toMatchSnapshot('login_error.png');
});
