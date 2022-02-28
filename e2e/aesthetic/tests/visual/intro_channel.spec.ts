// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import path from 'path';

import {test, expect} from '@playwright/test';
import {Eyes, CheckSettings} from '@applitools/eyes-playwright';

import {initSetup, getPreferenceWithHideInVisualTesting} from '../../support/server';
import {ChannelPage, LandingLoginPage, LoginPage} from '../../support/ui/page';
import {duration, wait} from '../../support/utils';
import {snapshotWithApplitools, snapshotWithPercy} from '../../support/visual';
import testConfig from '../../test.config';

let eyes: Eyes;

test.afterAll(async () => {
    await eyes?.close();
});

test('Intro to channel as regular user', async ({page, isMobile, browserName}, testInfo) => {
    let targetWindow: CheckSettings;
    ({eyes, targetWindow} = await snapshotWithApplitools(page, isMobile, browserName, testInfo.title));

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

    // Post a message into a channel
    const channelPage = new ChannelPage(page);
    await expect(channelPage.postTextbox.input).toBeVisible();
    await wait(duration.one_sec);

    // Should match with error at login page
    if (!testConfig.percyEnabled || !testConfig.applitoolsEnabled) {
        expect(await page.screenshot({fullPage: true})).toMatchSnapshot('intro_channel.png');
    }

    // Visual test with percy
    await snapshotWithPercy(page, isMobile, browserName, 'Intro to channel page');

    // Visual test with applitools
    await eyes?.check('Intro to channel page', targetWindow);
});
