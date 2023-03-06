// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Locator, Page} from '@playwright/test';

import {GlobalHeader} from '@e2e-support/ui/components';

export default class BoardsCreatePage {
    readonly boards = 'Boards';
    readonly page: Page;
    readonly globalHeader: GlobalHeader;
    readonly createBoardHeading: Locator;
    readonly createEmptyBoardButton: Locator;
    readonly useTemplateButton: Locator;
    readonly boardsView: Locator;
    readonly boardsViewDropdown: Locator;
    readonly boardsAddView: Locator;
    readonly boardsAddViewSubMenu: Locator;
    readonly boardsViewMenu: Locator;
    readonly boardsGalleryView: Locator;
    readonly boardsGalleryHeader: Locator;
    readonly boardsTableHeader: Locator;
    readonly boardsTableView: Locator;

    constructor(page: Page) {
        this.page = page;
        this.boardsView = page.locator('[placeholder="Untitled View"]');
        this.boardsViewDropdown = page.getByLabel('View menu');
        this.boardsTableHeader = page.locator('.Table  #mainBoardHeader');
        this.boardsGalleryHeader = page.locator('.Gallery > .octo-gallery-new');
        this.boardsTableView = page.getByLabel('Table');
        this.boardsGalleryView = page.getByLabel('Gallery');
        this.boardsViewMenu = page.locator('menu-contents');
        this.boardsAddView = page.locator('#__addView');
        this.boardsAddViewSubMenu = page.locator('div.subMenu');
        this.createBoardHeading = page.getByRole('heading', {name: 'Create a board'});
        this.createEmptyBoardButton = page.getByRole('button', {name: ' Create an empty board'});
        this.globalHeader = new GlobalHeader(this.page.locator('#global-header'));
        this.useTemplateButton = page.getByRole('button', {name: 'Use this template'});
    }

    async goto(teamId = '') {
        let boardsUrl = '/boards';
        if (teamId) {
            boardsUrl += `/team/${teamId}`;
        }

        await this.page.goto(boardsUrl);
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

    async openBoardsViewMenu() {
        await this.boardsViewDropdown.click();
        await this.boardsViewMenu.isVisible();
    }

    async hoverOnAddViewOption() {
        await this.boardsAddView.hover();
        await this.boardsAddViewSubMenu.isVisible({timeout: 10});
    }

    async selectTableView() {
        await this.boardsTableView.click();
        await this.boardsTableHeader.isVisible();
    }

    async selectGalleryView() {
        await this.boardsGalleryView.hover();
        await this.boardsGalleryHeader.isVisible({timeout: 10});
    }

    async assertTableViewisSelected() {
        await this.openBoardsViewMenu();
        await this.hoverOnAddViewOption();
        await this.selectTableView();
    }

    async assertGalleryViewisSelected() {
        await this.openBoardsViewMenu();
        await this.hoverOnAddViewOption();
        await this.selectGalleryView();
    }
}

export {BoardsCreatePage};
