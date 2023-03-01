// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test} from '@playwright/test';

import {LandingLoginPage} from '@e2e-support/ui/page';
import {matchSnapshot} from '@e2e-support/visual';

test('/landing#/login', async ({page, isMobile, browserName, viewport}, testInfo) => {
    const landingLoginPage = new LandingLoginPage(page);

    // Go to landing login page
    await landingLoginPage.goto();

    // Match snapshot of landing page
    await matchSnapshot(testInfo, {page, isMobile, browserName, viewport});
});
