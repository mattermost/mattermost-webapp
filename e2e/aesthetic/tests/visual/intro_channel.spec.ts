// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import path from 'path';

import {test, expect} from '@playwright/test';
import percySnapshot from '@percy/playwright';

import {initSetup, getPreferenceWithHideInVisualTesting} from '../../support/server';
import {ChannelPage, LandingLoginPage, LoginPage, TipsPage} from '../../support/ui/page';
import {duration, wait} from '../../support/utils';
import testConfig from '../../test.config';

test('Intro to channel as regular user', async ({page, isMobile, browserName}) => {
    const {userClient, adminConfig, user} = await initSetup();
    const hideValue = '.hide-team-header,.hide-post-header-time';
    const preference = getPreferenceWithHideInVisualTesting(user.id, hideValue);
    await userClient.savePreferences(user.id, [preference]);

    const fullPath = path.join(path.resolve(__dirname), '../..', 'support/fixtures/mattermost-icon_128x128.png');
    await userClient.uploadProfileImage(user.id, fullPath);

    // Go to login page
    const loginPage = new LoginPage(page, adminConfig);
    await loginPage.goto();

    if (isMobile) {
        // Click view in browser
        const landingLoginPage = new LandingLoginPage(page);
        await landingLoginPage.viewInBrowserButton.click();
    }

    // Should match default login page
    await expect(await loginPage.siteNameHeader).toBeVisible();

    // Login as a new user
    await loginPage.login(user);

    // Skip on getting started
    const tipsPage = new TipsPage(page);
    await tipsPage.skipLink.click();

    // Post a message into a channel
    const channelPage = new ChannelPage(page);
    await expect(channelPage.postTextbox.input).toBeVisible();
    await wait(duration.one_sec);

    // Should match with error at login page
    expect(await page.screenshot({fullPage: true})).toMatchSnapshot('intro_channel.png');
    await wait(duration.ten_sec);

    // Visual test with percy
    if (!isMobile && browserName === 'chromium' && testConfig.percyEnabled) {
        await percySnapshot(page, 'Intro to channel page');
    }
});
