// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, Page} from '@playwright/test';

export default class ChannelsPost {
    readonly page: Page;
    readonly boardsProfileImage: Locator;

    constructor(page: Page) {
        this.page = page;

        this.boardsProfileImage = page.getByAltText('boards profile image');
    }
}
