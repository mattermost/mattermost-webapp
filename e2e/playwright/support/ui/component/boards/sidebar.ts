// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, Page} from '@playwright/test';

export default class BoardsSidebar {
    readonly page: Page;
    readonly plusButton: Locator;
    readonly createNewBoardMenuItem: Locator;
    readonly createNewCategoryMenuItem: Locator;

    constructor(page: Page) {
        this.page = page;

        this.plusButton = page.locator('.add-board-icon');
        this.createNewBoardMenuItem = page.getByRole('button', {name: 'Create new board'});
        this.createNewCategoryMenuItem = page.getByRole('button', {name: 'Create New Category'});
    }
}
