// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Locator, Page} from '@playwright/test';

import {BoardsSidebar, GlobalHeader} from '@e2e-support/ui/component';

export default class BoardsCreatePage {
    readonly boards = 'Boards';
    readonly page: Page;
    readonly boardsSidebar: BoardsSidebar;
    readonly globalHeader: GlobalHeader;
    readonly createBoardHeading: Locator;
    readonly createEmptyBoardButton: Locator;
    readonly useTemplateButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.boardsSidebar = new BoardsSidebar(page);
        this.globalHeader = new GlobalHeader(page);
        this.createBoardHeading = page.getByRole('heading', {name: 'Create a board'});
        this.createEmptyBoardButton = page.getByRole('button', {name: ' Create an empty board'});
        this.useTemplateButton = page.getByRole('button', {name: 'Use this template'});
    }

    async toBeVisible() {
        await this.globalHeader.toBeVisible(this.boards);
        await expect(this.createEmptyBoardButton).toBeVisible();
        await expect(this.useTemplateButton).toBeVisible();
        await expect(this.createBoardHeading).toBeVisible();
    }

    async createEmptyBoard() {
        await this.createEmptyBoardButton.click();
    }
}
