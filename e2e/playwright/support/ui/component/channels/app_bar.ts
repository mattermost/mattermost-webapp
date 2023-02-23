// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Locator, Page} from '@playwright/test';

export default class ChannelsAppBar {
    readonly page: Page;
    readonly container: Locator;
    readonly playbooksIcon: Locator;

    constructor(page: Page) {
        this.page = page;

        this.container = page.locator('.app-bar');
        this.playbooksIcon = page.locator('#app-bar-icon-playbooks').getByRole('img');
    }

    async toBeVisible() {
        await expect(this.container).toBeVisible();
    }
}
