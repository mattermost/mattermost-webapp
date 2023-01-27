// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, Page} from '@playwright/test';

export default class LandingLoginPage {
    readonly page: Page;
    readonly viewInAppButton: Locator;
    readonly viewInDesktopAppButton: Locator;
    readonly viewInBrowserButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.viewInAppButton = page.locator('text=View in App');
        this.viewInDesktopAppButton = page.locator('text=View in Desktop App');
        this.viewInBrowserButton = page.locator('text=View in Browser');
    }

    async goto() {
        await this.page.goto('/landing#/login', {waitUntil: 'domcontentloaded'});
        await this.viewInBrowserButton.waitFor();
    }
}
