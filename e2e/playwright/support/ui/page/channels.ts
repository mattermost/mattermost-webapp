// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Page} from '@playwright/test';

import {ChannelsAppBar, ChannelsPost, ChannelsCenterTextbox, GlobalHeader} from '@e2e-support/ui/component';
import {isSmallScreen} from '@e2e-support/utils';

export default class ChannelsPage {
    readonly channels = 'Channels';
    readonly page: Page;
    readonly isSmallScreen: boolean;
    readonly channelsPost: ChannelsPost;
    readonly channelsTextbox: ChannelsCenterTextbox;
    readonly globalHeader: GlobalHeader;
    readonly appBar: ChannelsAppBar;

    constructor(page: Page) {
        this.page = page;
        this.isSmallScreen = isSmallScreen(this.page.viewportSize());
        this.channelsPost = new ChannelsPost(page);
        this.channelsTextbox = new ChannelsCenterTextbox(page);
        this.globalHeader = new GlobalHeader(page);
        this.appBar = new ChannelsAppBar(page);
    }

    async toBeVisible() {
        if (!this.isSmallScreen) {
            await this.globalHeader.toBeVisible(this.channels);
        }
        await this.channelsTextbox.toBeVisible();
    }

    async postMessage(message: string) {
        await this.channelsTextbox.input.waitFor();
        await this.channelsTextbox.postMessage(message);
    }
}
