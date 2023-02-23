// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, test} from '@playwright/test';

import {initSetup, shouldHaveBoardsEnabled} from '@e2e-support/server';
import {shouldSkipInSmallScreen} from '@e2e-support/utils';
import {BoardsCreatePage, BoardsViewPage, ChannelsPage} from '@e2e-support/ui/page';

shouldSkipInSmallScreen();

test.beforeAll(async () => {
    await shouldHaveBoardsEnabled();
});

test('MM-T4274 Create an Empty Board', async ({browser}) => {
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

    // Create empty board
    await boardsCreatePage.createEmptyBoard();

    // Should have redirected to boards view page
    const boardsViewPage = new BoardsViewPage(page);
    await boardsViewPage.toBeVisible();
    await boardsViewPage.shouldHaveUntitledBoard();

    // Type new title and hit enter
    const title = 'Testing';
    await boardsViewPage.editableTitle.fill(title);
    await boardsViewPage.editableTitle.press('Enter');

    // Should update the title in heading and in sidebar
    expect(await boardsViewPage.editableTitle.getAttribute('value')).toBe(title);
    await page.getByRole('button', {name: ` ${title}`}).isVisible();
});
