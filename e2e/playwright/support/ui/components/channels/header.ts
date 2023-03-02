// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Locator} from '@playwright/test';

export default class ChannelsHeader {
    readonly container: Locator;

    readonly startCallButton;
    readonly joinCallButton;

    constructor(container: Locator) {
        this.container = container;

        this.startCallButton = container.getByRole('button', {name: '󰷰 Start call'});
        this.joinCallButton = container.getByRole('button', {name: '󰷰 Join call'});
    }

    async toBeVisible() {
        await expect(this.container).toBeVisible();
    }
}

export {ChannelsHeader};
