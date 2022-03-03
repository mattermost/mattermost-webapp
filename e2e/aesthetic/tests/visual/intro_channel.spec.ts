// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import path from 'path';

import {test, expect} from '@playwright/test';
import {Eyes, CheckSettings} from '@applitools/eyes-playwright';

import {initSetup, getPreferenceWithHideInVisualTesting} from '../../support/server';
import {ChannelPage, LandingLoginPage, LoginPage} from '../../support/ui/page';
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
    await userClient.uploadProfileImageX(user.id, fullPath);

    // Go to login page
    const loginPage = new LoginPage(page, adminConfig);
    await loginPage.goto();

    if (isMobile) {
        // Click view in browser
        const landingLoginPage = new LandingLoginPage(page);
        await landingLoginPage.viewInBrowserButton.click();
    }

    // Login as a new user
    await loginPage.siteNameHeader.waitFor();
    await page.waitForLoadState('domcontentloaded');
    await loginPage.login(user);

    // Should have redirected to channel page
    const channelPage = new ChannelPage(page);
    await page.waitForLoadState('domcontentloaded');
    await expect(channelPage.postTextbox.input).toBeVisible();

    // Should match with error at login page
    if (!testConfig.percyEnabled || !testConfig.applitoolsEnabled) {
        expect(await page.screenshot({fullPage: true})).toMatchSnapshot('intro_channel.png');
    }

    // Visual test with percy
    await snapshotWithPercy(page, isMobile, browserName, 'Intro to channel page');

    // Visual test with applitools
    await eyes?.check('Intro to channel page', targetWindow);
});
