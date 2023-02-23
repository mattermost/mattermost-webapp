// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Locator, Page} from '@playwright/test';

import {GlobalHeader} from '@e2e-support/ui/component';

export default class BoardsViewPage {
    readonly boards = 'Boards';
    readonly page: Page;
    readonly globalHeader: GlobalHeader;
    readonly topHead: Locator;
    readonly editableTitle: Locator;
    readonly shareButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.globalHeader = new GlobalHeader(page);
        this.topHead = page.locator('.top-head');
        this.editableTitle = this.topHead.getByPlaceholder('Untitled board');
        this.shareButton = page.getByRole('button', {name: '󰍁 Share'});
    }

    async toBeVisible() {
        await this.page.waitForLoadState('networkidle');
        await this.globalHeader.toBeVisible(this.boards);
        await expect(this.shareButton).toBeVisible();
        await expect(this.topHead).toBeVisible();
    }

    async shouldHaveUntitledBoard() {
        await this.editableTitle.isVisible();
        expect(await this.editableTitle.getAttribute('value')).toBe('');
        await expect(this.page.getByTitle('(Untitled Board)')).toBeVisible();
    }
}
