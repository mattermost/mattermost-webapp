// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FullConfig} from '@playwright/test';

async function globalSetup(config: FullConfig) {
    console.log('global setup');
}

export default globalSetup;
