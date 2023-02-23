// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect} from '@playwright/test';

import {getAdminClient} from './init';

export async function shouldHaveBoardsEnabled() {
    const {adminClient} = await getAdminClient();
    const config = await adminClient.getConfig();

    const boardsEnabled =
        (typeof config.FeatureFlags.BoardsProduct === 'boolean' && config.FeatureFlags.BoardsProduct) ||
        config.PluginSettings.PluginStates['focalboard'].Enable;

    expect(boardsEnabled, boardsEnabled ? '' : 'Should have boards enabled').toBeTruthy();
}
