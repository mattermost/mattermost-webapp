// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Page} from '@playwright/test';

import {waitUntil} from '@e2e-support/test_action';
import {components} from '@e2e-support/ui/components';
import {duration, isSmallScreen} from '@e2e-support/util';

export default class ChannelsPage {
    readonly channels = 'Channels';
    readonly page: Page;
    readonly postCreate;
    readonly globalHeader;
    readonly header;
    readonly appBar;
    readonly callsWidget;
    readonly callsToast;
    readonly sidebarRight;

    constructor(page: Page) {
        this.page = page;
        this.postCreate = new components.ChannelsPostCreate(page.locator('#post-create'));
        this.globalHeader = new components.GlobalHeader(page.locator('#global-header'));
        this.header = new components.ChannelsHeader(page.locator('.channel-header'));
        this.appBar = new components.ChannelsAppBar(page.locator('.app-bar'));
        this.callsWidget = new components.CallsWidget(page.locator('#calls-widget'));
        this.callsToast = new components.ChannelsCallsToast(page.locator('#calls-channel-toast'));
        this.sidebarRight = new components.ChannelsSidebarRight(page.locator('#sidebar-right'));
    }

    async goto(teamName = '', channelName = '') {
        let channelsUrl = '/';
        if (teamName) {
            channelsUrl += `${teamName}`;
            if (channelName) {
                channelsUrl += `/${channelName}`;
            }
        }

        await this.page.goto(channelsUrl);
    }

    async toBeVisible() {
        if (!isSmallScreen(this.page.viewportSize())) {
            await this.globalHeader.toBeVisible(this.channels);
        }
        await this.postCreate.toBeVisible();
    }

    async postMessage(message: string) {
        await this.postCreate.input.waitFor();
        await this.postCreate.postMessage(message);
    }

    async getFirstPost() {
        await this.page.getByTestId('postView').first().waitFor();
        const post = await this.page.getByTestId('postView').first();
        return new components.ChannelsPost(post);
    }

    async getLastPost() {
        await this.page.getByTestId('postView').last().waitFor();
        const post = await this.page.getByTestId('postView').last();
        return new components.ChannelsPost(post);
    }

    async getNthPost(index: number) {
        await this.page.getByTestId('postView').nth(index).waitFor();
        const post = await this.page.getByTestId('postView').nth(index);
        return new components.ChannelsPost(post);
    }

    async getPostById(id: string) {
        await this.page.locator(`[id="post_${id}"]`).waitFor();
        const post = await this.page.locator(`[id="post_${id}"]`);
        return new components.ChannelsPost(post);
    }

    async getRHSPostById(id: string) {
        await this.page.locator(`[id="rhsPost_${id}"]`).waitFor();
        const post = await this.page.locator(`[id="rhsPost_${id}"]`);
        return new components.ChannelsPost(post);
    }

    async waitUntilLastPostContains(text: string, timeout = duration.ten_sec) {
        await waitUntil(
            async () => {
                const post = await this.getLastPost();
                const content = await post.container.textContent();
                return content?.includes(text);
            },
            {timeout}
        );
    }

    async waitUntilPostWithIdContains(id: string, text: string, timeout = duration.ten_sec) {
        await waitUntil(
            async () => {
                const post = await this.getPostById(id);
                const content = await post.container.textContent();

                return content?.includes(text);
            },
            {timeout}
        );
    }

    async startCallFromHeader() {
        await this.header.startCallButton.waitFor({state: 'visible'});
        await this.header.startCallButton.click();
    }

    async joinCallFromToast() {
        await this.callsToast.message.waitFor({state: 'visible'});
        await this.callsToast.message.getByText('Join Call').click();
    }

    async joinCallFromHeader() {
        await this.header.joinCallButton.waitFor({state: 'visible'});
        await this.header.joinCallButton.click();
    }

    async leaveCallFromWidget() {
        await this.callsWidget.leaveButton.waitFor({state: 'visible'});
        await this.callsWidget.leaveButton.click();
    }
}

export {ChannelsPage};
