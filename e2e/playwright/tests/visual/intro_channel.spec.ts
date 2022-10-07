// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test, expect} from '@playwright/test';
import {Eyes} from '@applitools/eyes-playwright';

import {initSetup} from '@support/server';
import {ChannelPage, LoginPage} from '@support/ui/page';
import {hideTeamHeader, hidePostHeaderTime} from '@support/ui/style';
import {matchSnapshot} from '@support/visual';

let eyes: Eyes;

test.afterAll(async () => {
    await eyes?.close();
});

test('Intro to channel as regular user', async ({page, isMobile, browserName, viewport}, testInfo) => {
    const testArgs = {page, isMobile, browserName, viewport};
    const {adminConfig, user} = await initSetup({withDefaultProfileImage: true});

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
    ({eyes} = await matchSnapshot(testInfo.title, testArgs));
});
