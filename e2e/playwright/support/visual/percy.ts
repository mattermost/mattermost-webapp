// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import percySnapshot from '@percy/playwright';

import testConfig, {TestArgs} from '@test.config';

export default async function snapshotWithPercy(name: string, testArgs: TestArgs) {
    if (!testArgs.isMobile && testArgs.browserName === 'chromium' && testConfig.percyEnabled) {
        if (!process.env.PERCY_TOKEN) {
            console.error('Error: Token is missing! Please set using: "export PERCY_TOKEN=<change_me>"');
        }

        const {page, viewport} = testArgs;

        await percySnapshot(page, name, {widths: [viewport.width], minHeight: viewport.height});
    }
}
