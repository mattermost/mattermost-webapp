// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test} from '@e2e-support/test_fixture';
import {shouldSkipInSmallScreen} from '@e2e-support/flag';
import {ChannelsPage} from '@e2e-support/ui/pages';

let adminChannelsPage: ChannelsPage;
let userChannelsPage: ChannelsPage;
const startedCall = 'started a call';
const leaveCall = 'Leave call';

shouldSkipInSmallScreen();

test.beforeAll(async ({pw}) => {
    await pw.shouldHaveCallsEnabled();
});

test.beforeEach(async ({pw, pages}) => {
    await pw.shouldHaveCallsEnabled();

    // Create new user
    const {user, adminUser, team} = await pw.initSetup();

    // Sign in as admin, visit a channel and start a call from header
    const {page: adminPage} = await pw.testBrowser.login(adminUser);
    adminChannelsPage = new pages.ChannelsPage(adminPage);
    await adminChannelsPage.goto(team.name);
    await adminChannelsPage.toBeVisible();
    await adminChannelsPage.startCallFromHeader();

    // Verify calls widget becomes visible for admin
    await adminChannelsPage.callsWidget.toBeVisible();
    await adminChannelsPage.waitUntilLastPostContains(startedCall);

    // Sign in as other user, visit a channel and verify Calls widget is not present
    const {page: userPage} = await pw.testBrowser.login(user);
    userChannelsPage = new pages.ChannelsPage(userPage);
    await userChannelsPage.goto();
    await userChannelsPage.toBeVisible();
    await userChannelsPage.waitUntilLastPostContains(startedCall);
    await userChannelsPage.callsWidget.toBeHidden();
});

test.afterEach(async () => {
    // Admin leave Calls
    await adminChannelsPage.leaveCallFromWidget();
    await adminChannelsPage.callsWidget.toBeHidden();

    // Explicitly close the page
    await userChannelsPage.page.close();
    await adminChannelsPage.page.close();
});

test('MM-T5400_1 Join a call from channel header button', async () => {
    // Join a call from header and verify Calls widget becomes visible
    await userChannelsPage.joinCallFromHeader();
    await userChannelsPage.callsWidget.toBeVisible();

    // Leave a call and verify Calls widget has disappeared
    await userChannelsPage.leaveCallFromWidget();
    await userChannelsPage.callsWidget.toBeHidden();
});

test('MM-T5400_2 Join a call from channel toast', async () => {
    // Start a call from toast and verify Calls widget becomes visible
    await userChannelsPage.joinCallFromToast();
    await userChannelsPage.callsWidget.toBeVisible();

    // Leave a call and verify Calls widget has disappeared
    await userChannelsPage.leaveCallFromWidget();
    await userChannelsPage.callsWidget.toBeHidden();
});

test('MM-T5400_3 Join a call from center post', async () => {
    const userCallsPost = await userChannelsPage.getLastPost();
    await userCallsPost.body.getByText('Join call').click();

    // Verify Calls widget becomes visible
    await userChannelsPage.callsWidget.toBeVisible();

    // Leave a call from post
    await userChannelsPage.waitUntilLastPostContains(leaveCall);
    await userCallsPost.body.getByText(leaveCall).click();
    await userChannelsPage.callsWidget.toBeHidden();
});

test('MM-T5400_4 Join a call from RHS post', async () => {
    // Click reply to post and verify the RHS has opened
    const centerPost = await userChannelsPage.getLastPost();
    await centerPost.openRHS();
    await userChannelsPage.sidebarRight.toBeVisible();

    // Join a call from RHS post
    const postId = await centerPost.getId();
    const rhsPost = await userChannelsPage.getRHSPostById(postId);
    await rhsPost.body.getByText('Join call').click();

    // Verify Calls widget becomes visible
    await userChannelsPage.callsWidget.toBeVisible();

    // Leave a call from RHS post
    await userChannelsPage.waitUntilLastPostContains(leaveCall);
    await rhsPost.body.getByText(leaveCall).click();
    await userChannelsPage.callsWidget.toBeHidden();
});
