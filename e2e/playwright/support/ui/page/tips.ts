// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, Page} from '@playwright/test';

export class TipsPage {
    readonly page: Page;
    readonly skipLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.skipLink = page.locator('text=Skip Getting Started');
    }
}
