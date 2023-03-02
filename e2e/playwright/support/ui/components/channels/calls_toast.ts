// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Locator} from '@playwright/test';

export default class ChannelsCallsToast {
    readonly container: Locator;

    readonly message;
    readonly closeButton;

    constructor(container: Locator) {
        this.container = container;

        this.message = container.locator('.toast__message');
        this.closeButton = container.locator('.toast__dismiss');
    }

    async toBeVisible() {
        await expect(this.container).toBeVisible();
    }
}

export {ChannelsCallsToast};
