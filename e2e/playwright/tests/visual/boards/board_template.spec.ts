// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test} from '@playwright/test';

import {initSetup, shouldHaveBoardsEnabled} from '@e2e-support/server';
import {shouldSkipInSmallScreen} from '@e2e-support/utils';
import {BoardsCreatePage, ChannelsPage} from '@e2e-support/ui/page';
import {matchSnapshot} from '@e2e-support/visual';

shouldSkipInSmallScreen();

test.beforeAll(async () => {
    await shouldHaveBoardsEnabled();
});

test('Board template', async ({browser, isMobile, browserName, viewport}, testInfo) => {
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

    // Switch to Boards page
    await channelsPage.globalHeader.switchProduct('Boards');

    // Should have redirected to boards create page
    const boardsCreatePage = new BoardsCreatePage(page);
    await boardsCreatePage.toBeVisible();

    // Match snapshot of create board page
    const testArgs = {page, isMobile, browserName, viewport};
    await matchSnapshot(testInfo, testArgs);
});
