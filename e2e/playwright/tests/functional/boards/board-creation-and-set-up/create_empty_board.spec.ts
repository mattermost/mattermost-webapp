// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, test} from '@e2e-support/test_fixture';
import {shouldSkipInSmallScreen} from '@e2e-support/flag';

shouldSkipInSmallScreen();

test('MM-T4274 Create an Empty Board', async ({pw, pages}) => {
    await pw.shouldHaveBoardsEnabled();

    // Create and sign in a new user
    const {user} = await pw.initSetup();

    // Log in a user in new browser context
    const {page} = await pw.testBrowser.login(user);

    // Visit a default channel page
    const channelsPage = new pages.ChannelsPage(page);
    await channelsPage.goto();
    await channelsPage.toBeVisible();

    // Switch to Boards page
    await channelsPage.globalHeader.switchProduct('Boards');

    // Should have redirected to boards create page
    const boardsCreatePage = new pages.BoardsCreatePage(page);
    await boardsCreatePage.toBeVisible();

    // Create empty board
    await boardsCreatePage.createEmptyBoard();

    // Should have redirected to boards view page
    const boardsViewPage = new pages.BoardsViewPage(page);
    await boardsViewPage.toBeVisible();
    await boardsViewPage.shouldHaveUntitledBoard();

    // Type new title and hit enter
    const title = 'Testing';
    await boardsViewPage.editableTitle.fill(title);
    await boardsViewPage.editableTitle.press('Enter');

    // Should update the title in heading and in sidebar
    expect(await boardsViewPage.editableTitle.getAttribute('value')).toBe(title);
    await boardsViewPage.sidebar.waitForTitle(title);
});

test('MM-T4290: Duplicating and deleting a board', async ({pw, pages}) => {
    await pw.shouldHaveBoardsEnabled();

    // Create and sign in a new user
    const {user} = await pw.initSetup();

    // Log in a user in new browser context
    const {page} = await pw.testBrowser.login(user);

    // Visit a default channel page
    const channelsPage = new pages.ChannelsPage(page);
    await channelsPage.goto();
    await channelsPage.toBeVisible();

    // Switch to Boards page
    await channelsPage.globalHeader.switchProduct('Boards');

    // Should have redirected to boards create page
    const boardsCreatePage = new pages.BoardsCreatePage(page);
    await boardsCreatePage.toBeVisible();

    // Create empty board
    await boardsCreatePage.createEmptyBoard();

    // Should have redirected to boards view page
    const boardsViewPage = new pages.BoardsViewPage(page);
    await boardsViewPage.toBeVisible();
    await boardsViewPage.shouldHaveUntitledBoard();

    // Type new title and hit enter
    const title = 'Testing';
    await boardsViewPage.editableTitle.fill(title);
    await boardsViewPage.editableTitle.press('Enter');

    // Should update the title in heading and in sidebar
    expect(await boardsViewPage.editableTitle.getAttribute('value')).toBe(title);
    await boardsViewPage.sidebar.waitForTitle(title);

    // Should create a duplicate board
    await boardsViewPage.createDuplicateBoard(title);

    // Should verify duplicate board is created
    await boardsViewPage.shouldHaveBoardName(`${title} copy`);

    // Should delete board and confirm deletion
    await boardsViewPage.deleteBoard(`${title} copy`);
});

test('MM-T4277: Set up Views', async ({pw, pages}) => {
    await pw.shouldHaveBoardsEnabled();

    // Create and sign in a new user
    const {user} = await pw.initSetup();

    // Log in a user in new browser context
    const {page} = await pw.testBrowser.login(user);

    // Visit a default channel page
    const channelsPage = new pages.ChannelsPage(page);
    await channelsPage.goto();
    await channelsPage.toBeVisible();

    // Switch to Boards page
    await channelsPage.globalHeader.switchProduct('Boards');

    // Should have redirected to boards create page
    const boardsCreatePage = new pages.BoardsCreatePage(page);
    await boardsCreatePage.toBeVisible();

    // Create empty board
    await boardsCreatePage.createEmptyBoard();

    // Should have redirected to boards view page
    const boardsViewPage = new pages.BoardsViewPage(page);
    await boardsViewPage.toBeVisible();
    await boardsViewPage.shouldHaveUntitledBoard();

    // Type new title and hit enter
    const title = 'Testing';
    await boardsViewPage.editableTitle.fill(title);
    await boardsViewPage.editableTitle.press('Enter');

    // Should update the title in heading and in sidebar
    expect(await boardsViewPage.editableTitle.getAttribute('value')).toBe(title);
    await boardsViewPage.sidebar.waitForTitle(title);

    // Should select Table view and assert it's visibility
    await boardsViewPage.assertTableViewisSelected();
    await boardsViewPage.sidebar.assertTitleToBeVisible('Table view');

    // Should select Gallery view and assert it's visibility
    await boardsViewPage.assertGalleryViewisSelected();
    await boardsViewPage.sidebar.assertTitleToBeVisible('Gallery view');
});

test.only('MM-T4278: Managing and navigating views', async ({pw, pages}) => {
    await pw.shouldHaveBoardsEnabled();

    // Create and sign in a new user
    const {user} = await pw.initSetup();

    // Log in a user in new browser context
    const {page} = await pw.testBrowser.login(user);

    // Visit a default channel page
    const channelsPage = new pages.ChannelsPage(page);
    await channelsPage.goto();
    await channelsPage.toBeVisible();

    // Switch to Boards page
    await channelsPage.globalHeader.switchProduct('Boards');

    // Should have redirected to boards create page
    const boardsCreatePage = new pages.BoardsCreatePage(page);
    await boardsCreatePage.toBeVisible();

    // Create empty board
    await boardsCreatePage.createEmptyBoard();

    // Should have redirected to boards view page
    const boardsViewPage = new pages.BoardsViewPage(page);
    await boardsViewPage.toBeVisible();
    await boardsViewPage.shouldHaveUntitledBoard();

    // Type new title and hit enter
    const title = 'Testing';
    await boardsViewPage.editableTitle.fill(title);
    await boardsViewPage.editableTitle.press('Enter');

    // Should update the title in heading and in sidebar
    expect(await boardsViewPage.editableTitle.getAttribute('value')).toBe(title);
    await boardsViewPage.sidebar.waitForTitle(title);

    // Should select Table view and assert it's visibility
    await boardsViewPage.assertTableViewisSelected();
    await boardsViewPage.sidebar.assertTitleToBeVisible('Table view');

    // Should select Gallery view and assert it's visibility
    await boardsViewPage.assertGalleryViewisSelected();
    await boardsViewPage.sidebar.assertTitleToBeVisible('Gallery view');

    // Should duplicate and delete the view
    await boardsViewPage.duplicateBoardView();
    await boardsViewPage.deleteBoardView();
});
