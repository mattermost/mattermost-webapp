// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test, expect} from '@playwright/test';

import {initSetup} from '@e2e-support/server';
import {ChannelPage, LoginPage} from '@e2e-support/ui/page';
import {hideTeamHeader, hidePostHeaderTime} from '@e2e-support/ui/style';
import {matchSnapshot, Applitools} from '@e2e-support/visual';

let applitools: Applitools = {};

test.afterAll(async () => {
    await applitools.eyes?.close();
});

test('Intro to channel as regular user', async ({page, isMobile, browserName, viewport}, testInfo) => {
    const testArgs = {page, isMobile, browserName, viewport};
    const {adminConfig, user} = await initSetup();

    // Go to login page
    const loginPage = new LoginPage(page, adminConfig);
    await loginPage.goto();

    // Login as a new user
    await loginPage.title.waitFor();
    await loginPage.subtitle.waitFor();
    await page.waitForLoadState('domcontentloaded');
    await loginPage.login(user);

    // Should have redirected to channel page
    const channelPage = new ChannelPage(page);
    await page.waitForLoadState('domcontentloaded');
    await expect(channelPage.postTextbox.input).toBeVisible();

    // Hide dynamic elements of the page
    await page.addStyleTag({content: hideTeamHeader + hidePostHeaderTime});

    // Match snapshot of channel intro page
    applitools = await matchSnapshot(testInfo, testArgs);
});
