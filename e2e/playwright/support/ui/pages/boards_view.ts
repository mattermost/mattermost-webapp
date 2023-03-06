// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Locator, Page} from '@playwright/test';

import {BoardsSidebar, GlobalHeader, BoardsCreateModal} from '@e2e-support/ui/components';

export default class BoardsViewPage {
    readonly boards = 'Boards';
    readonly boardsAPIUrl: string;
    readonly boardsDuplicateURL: string;
    readonly boardsCreateModal: BoardsCreateModal;
    readonly boardsViewDropdown: Locator;
    readonly duplicateBoardButton: Locator;
    readonly deleteBoardButton: Locator;
    readonly deleteBoardConfirmationButton: Locator;
    readonly editableTitle: Locator;
    readonly globalHeader: GlobalHeader;
    readonly page: Page;
    readonly sidebar: BoardsSidebar;
    readonly shareButton: Locator;
    readonly topHead: Locator;
    readonly boardsViewMenu: Locator;
    readonly boardsViewName: Locator;
    readonly boardsAddView: Locator;
    readonly boardsAddViewSubMenu: Locator;
    readonly boardsTableView: Locator;
    readonly boardsTableHeader: Locator;
    readonly boardsGalleryView: Locator;
    readonly boardsGalleryHeader: Locator;
    readonly boardsDeleteView: Locator;
    readonly boardsDuplicateView: Locator;

    constructor(page: Page) {
        this.page = page;
        this.boardsViewDropdown = page.getByLabel('View menu');
        this.boardsViewMenu = page.locator('menu-contents');
        this.boardsViewName = page.locator('.SidebarBoardItem.sidebar-view-item.active');
        this.boardsGalleryHeader = page.locator('.Gallery > .octo-gallery-new');
        this.boardsGalleryView = page.getByLabel('Gallery');
        this.boardsDuplicateView = page.getByLabel('Duplicate view');
        this.boardsDeleteView = page.getByLabel('Delete view');
        this.boardsTableHeader = page.locator('div.octo-table-body');
        this.boardsTableView = page.getByLabel('Table');
        this.boardsAddViewSubMenu = page.locator('div.subMenu');
        this.boardsAddView = page.locator('#__addView');
        this.boardsAPIUrl = 'plugins/boards/api/v2/boards';
        this.boardsDuplicateURL = 'duplicate?asTemplate=false';
        this.boardsCreateModal = new BoardsCreateModal(page.locator('.menu-contents'));
        this.sidebar = new BoardsSidebar(page.locator('.octo-sidebar'));
        this.globalHeader = new GlobalHeader(this.page.locator('#global-header'));
        this.topHead = page.locator('.top-head');
        this.editableTitle = this.topHead.getByPlaceholder('Untitled board');
        this.shareButton = page.getByRole('button', {name: '󰍁 Share'});
        this.duplicateBoardButton = page.getByLabel('Duplicate board');
        this.deleteBoardButton = page.getByLabel('Delete board');
        this.deleteBoardConfirmationButton = page.locator('button.Button.filled.danger');
    }

    async goto(teamId = '', boardId = '', viewId = '', cardId = '') {
        let boardsUrl = '/boards';
        if (teamId) {
            boardsUrl += `/team/${teamId}`;
            if (boardId) {
                boardsUrl += `/${boardId}`;
                if (viewId) {
                    boardsUrl += `/${viewId}`;
                    if (cardId) {
                        boardsUrl += `/${cardId}`;
                    }
                }
            }
        }

        await this.page.goto(boardsUrl);
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

    async openBoardsMenuFor(boardName: string) {
        await (await this.sidebar.getBoardItem(boardName)).hover();
        await this.sidebar.activeBoardMenuIcon.click();
        await this.sidebar.boardMenuDraw.isVisible();
    }

    async createDuplicateBoard(boardName: string) {
        await this.openBoardsMenuFor(boardName);
        await this.duplicateBoardButton.click();
        await this.page.waitForResponse(
            (response) => response.url().includes(this.boardsDuplicateURL) && response.status() === 200
        );
        expect(await this.editableTitle.getAttribute('value')).toBe(`${boardName} copy`);
    }

    async shouldHaveBoardName(boardName: string) {
        await this.editableTitle.isVisible();
        expect(await this.editableTitle.getAttribute('value')).toBe(boardName);
    }

    async deleteBoard(boardName: string) {
        await this.openBoardsMenuFor(boardName);
        await this.deleteBoardButton.click();
        await this.deleteBoardConfirmationButton.click();
        await this.page.waitForResponse(
            (response) => response.url().includes(this.boardsAPIUrl) && response.status() === 200
        );
        expect((await this.sidebar.getBoardItem(boardName)).isHidden());
    }

    async openBoardsViewMenu() {
        await this.boardsViewDropdown.click();
        await this.boardsViewMenu.isVisible();
    }

    async hoverOnAddViewOption() {
        await this.boardsAddView.hover();
        await this.boardsAddViewSubMenu.isVisible();
    }

    async selectTableView() {
        await this.boardsTableView.click();
        await this.boardsTableHeader.isVisible();
    }

    async selectGalleryView() {
        await this.boardsGalleryView.click();
        await this.boardsGalleryHeader.isVisible();
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

    async deleteBoardView() {
        await this.boardsViewDropdown.click();
        await this.boardsDeleteView.click();
        await this.page.waitForResponse((response) => response.url().includes('blocks') && response.status() === 200);
    }

    async duplicateBoardView() {
        const currentBoardViewName = await this.boardsViewName.innerText();
        await this.boardsViewDropdown.click();
        await this.boardsDuplicateView.click();
        await this.page.waitForResponse(
            (response) => response.url().includes(this.boardsDuplicateURL) && response.status() === 200
        );
        expect(await this.boardsViewName.innerText()).toBe(`${currentBoardViewName} copy`);
    }
}

export {BoardsViewPage};
