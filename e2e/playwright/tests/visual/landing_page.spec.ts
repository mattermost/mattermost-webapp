// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test, expect} from '@playwright/test';

import {LandingLoginPage} from '../../support/ui/page';

test('/landing#/login', async ({page, isMobile}) => {
    test.skip(!isMobile, 'For mobile client only');

    const landingLoginPage = new LandingLoginPage(page);

    // Go to landing login page
    await landingLoginPage.goto();

    // Should match the landing login page
    expect(await page.screenshot({fullPage: true})).toMatchSnapshot('landing_login.png');
});
