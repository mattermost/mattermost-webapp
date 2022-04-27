// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Page} from '@playwright/test';

import {PostTextbox} from '../component/post_textbox';

export class ChannelPage {
    readonly page: Page;
    readonly postTextbox: PostTextbox;

    constructor(page: Page) {
        this.page = page;
        this.postTextbox = new PostTextbox(page);
    }

    async postMessage(message: string) {
        await this.postTextbox.input.waitFor();
        await this.postTextbox.postMessage(message);
    }
}
