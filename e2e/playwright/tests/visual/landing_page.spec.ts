// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test} from '@playwright/test';
import {Eyes} from '@applitools/eyes-playwright';

import {LandingLoginPage} from '@support/ui/page';
import {matchSnapshot} from '@support/visual';

let eyes: Eyes;

test.afterAll(async () => {
    await eyes?.close();
});

test('/landing#/login', async ({page, isMobile, browserName, viewport}, testInfo) => {
    const landingLoginPage = new LandingLoginPage(page);

    // Go to landing login page
    await landingLoginPage.goto();

    // Match snapshot of landing page
    ({eyes} = await matchSnapshot(testInfo.title, {page, isMobile, browserName, viewport}));
});
