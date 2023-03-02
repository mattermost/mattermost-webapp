// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, test} from '@e2e-support/test_fixture';
import {shouldSkipInSmallScreen} from '@e2e-support/flag';

shouldSkipInSmallScreen();

test('MM-Txxx Start and leave a call', async ({pw, pages}) => {
    await pw.shouldHaveCallsEnabled();

    // Create and sign in a new user
    const {user} = await pw.initSetup();
    const {page} = await pw.testBrowser.login(user);

    // Visit a channel
    const channelsPage = new pages.ChannelsPage(page);
    await channelsPage.goto();
    await channelsPage.toBeVisible();

    // Start a call by clicking "Start call" in the header
    await channelsPage.header.startCallButton.click();

    // Verify that the Calls widget becomes visible and call started message posted in channel
    await channelsPage.callsWidget.toBeVisible();

    // Wait until "started a call" message is posted in channel
    const callStarted = `${user.first_name + ' ' + user.last_name} started a call`;
    await channelsPage.waitUntilLastPostContains(callStarted);
    const callsPost = await channelsPage.getLastPost();
    expect(await callsPost.body.textContent()).toContain(callStarted);

    // Leave a call by clicking leave button in Calls widget
    await channelsPage.callsWidget.leaveButton.click();

    // Verify that the Calls widget has disappeared
    await channelsPage.callsWidget.toBeHidden();

    // Wait until message is updated with "Call ended" message
    const callEndedMessage = 'Call ended';
    const postId = await callsPost.getId();
    await channelsPage.waitUntilPostWithIdContains(postId, callEndedMessage);
    expect(await callsPost.body.textContent()).toContain(callEndedMessage);

    // Explicitly close the page
    await page.close();
});
