// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, test} from '@playwright/test';

import {initSetup} from '@e2e-support/server';
import {ChannelsPage} from '@e2e-support/ui/page';
import {hideDynamicChannelsContent} from '@e2e-support/ui/style';
import {isSmallScreen} from '@e2e-support/utils';
import {matchSnapshot} from '@e2e-support/visual';

test('Intro to channel as regular user', async ({browser, isMobile, browserName, viewport}, testInfo) => {
    // Create and sign in a new user
    const {user, testBrowser} = await initSetup(browser);

    // Log in a user in new browser context
    const context = await testBrowser.login(user);
    const page = await context.newPage();

    // Visit a default channel page
    await page.goto('/');

    // Should have redirected to channel page
    const channelsPage = new ChannelsPage(page);
    await channelsPage.toBeVisible();

    // Wait for Boards' bot image to be loaded
    await channelsPage.channelsPost.boardsProfileImage.waitFor({state: 'visible'});

    // Wait for Playbooks icon to be loaded in App bar, except in iphone
    if (!isSmallScreen(viewport)) {
        await expect(channelsPage.appBar.playbooksIcon).toBeVisible();
    }

    // Hide dynamic elements of Channels page
    await hideDynamicChannelsContent(page);

    // Match snapshot of channel intro page
    const testArgs = {page, isMobile, browserName, viewport};
    await matchSnapshot(testInfo, testArgs);
});
