// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Locator} from '@playwright/test';

export default class CallsWidget {
    readonly container: Locator;

    readonly leaveButton;
    readonly connectingText;

    constructor(container: Locator) {
        this.container = container;

        this.leaveButton = container.locator('#calls-widget-leave-button');
        this.connectingText = container.getByText('Connecting to the call...');
    }

    async toBeVisible() {
        await expect(this.container).toBeVisible();
    }

    async toBeHidden() {
        await expect(this.container).toBeHidden();
    }
}

export {CallsWidget};
