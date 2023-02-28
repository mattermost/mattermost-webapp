// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test, expect} from '@playwright/test';

import {initSetup} from '@e2e-support/server';
import {ChannelPage} from '@e2e-support/ui/page';
import {hideTeamHeader, hidePostHeaderTime} from '@e2e-support/ui/style';
import {matchSnapshot} from '@e2e-support/visual';

test('Intro to channel as regular user', async ({browser, isMobile, browserName, viewport}, testInfo) => {
    // Create and sign in a new user
    const {user, testBrowser} = await initSetup(browser);

    // Log in a user in new browser context
    const context = await testBrowser.login(user);
    const page = await context.newPage();

    // Visit a default channel page
    page.goto('/', {waitUntil: 'networkidle'});

    // Should have redirected to channel page
    const channelPage = new ChannelPage(page);
    await page.waitForLoadState('networkidle');
    await expect(channelPage.postTextbox.input).toBeVisible();

    // Wait for Boards' bot image to be loaded
    // await page.waitForResponse
    await page.getByAltText('boards profile image').waitFor({state: 'visible'});

    // Wait for Playbooks icon to be loaded in App bar, except in iphone
    if (testInfo.project.name !== 'iphone') {
        await page.locator('#app-bar-icon-playbooks').getByRole('img').waitFor();
    }

    // Hide dynamic elements of the page
    await page.addStyleTag({content: hideTeamHeader + hidePostHeaderTime});

    // Match snapshot of channel intro page
    const testArgs = {page, isMobile, browserName, viewport};
    await matchSnapshot(testInfo, testArgs);
});
