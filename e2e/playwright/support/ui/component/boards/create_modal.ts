// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Locator, Page} from '@playwright/test';

export default class BoardsCreateModal {
    readonly page: Page;
    readonly productSwitchMenu: Locator;

    constructor(page: Page) {
        this.page = page;

        this.productSwitchMenu = page.getByRole('button', {name: 'Product switch menu'});
    }

    async switchProduct(name: string) {
        await this.productSwitchMenu.click();
        await this.page.getByRole('link', {name: ` ${name}`}).click();
    }

    async toBeVisible(name: string) {
        await expect(this.page.getByRole('heading', {name})).toBeVisible();
    }
}
