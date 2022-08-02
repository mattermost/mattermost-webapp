// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Page} from '@playwright/test';
import percySnapshot from '@percy/playwright';

import testConfig from '../../test.config';

export default async function snapshotWithPercy(page: Page, isMobile: boolean, browserName: string, name: string) {
    if (!isMobile && browserName === 'chromium' && testConfig.percyEnabled) {
        if (!process.env.PERCY_TOKEN) {
            console.error('Error: Token is missing! Please set using: "export PERCY_TOKEN=<change_me>"');
        }

        await percySnapshot(page, name);
    }
}
