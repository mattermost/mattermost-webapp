// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator} from '@playwright/test';

export default class BoardsSidebar {
    readonly container: Locator;
    readonly plusButton: Locator;
    readonly createNewBoardMenuItem: Locator;
    readonly createNewCategoryMenuItem: Locator;
    readonly titles: Locator;
    readonly activeBoardMenuIcon: Locator;
    readonly boardMenuDraw: Locator;

    constructor(container: Locator) {
        this.container = container;

        this.plusButton = container.locator('.add-board-icon');
        this.createNewBoardMenuItem = container.getByRole('button', {name: 'Create new board'});
        this.createNewCategoryMenuItem = container.getByRole('button', {name: 'Create New Category'});
        this.titles = container.locator('.SidebarBoardItem > .octo-sidebar-title');
        this.activeBoardMenuIcon = container.locator('div.SidebarBoardItem.subitem.active button');
        this.boardMenuDraw = container.locator('div.SidebarBoardItem.subitem.active .menu-contents');
    }

    async waitForTitle(name: string) {
        await this.container.getByRole('button', {name: ` ${name}`}).waitFor({state: 'visible'});
    }

    async assertTitleToBeVisible(name: string) {
        await this.titles.getByText(name).isVisible();
    }

    async getBoardItem(name: string) {
        return this.titles.filter({hasText: name});
    }
}

export {BoardsSidebar};
