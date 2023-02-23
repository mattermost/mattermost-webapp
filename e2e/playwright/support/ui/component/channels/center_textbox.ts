// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Locator, Page} from '@playwright/test';

export default class ChannelsCenterTextbox {
    readonly page: Page;
    readonly input: Locator;
    readonly attachment: Locator;
    readonly emoji: Locator;

    constructor(page: Page) {
        this.page = page;

        this.input = page.locator('[data-testid="post_textbox"]');
        this.attachment = page.locator('[aria-label="attachment"]');
        this.emoji = page.locator('[aria-label="select an emoji"]');
    }

    async postMessage(message: string) {
        await this.input.fill(message);
    }

    async toBeVisible() {
        await expect(this.input).toBeVisible();
    }
}
