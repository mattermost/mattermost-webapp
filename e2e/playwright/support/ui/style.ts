// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Page} from '@playwright/test';

const visibilityHidden = 'visibility: hidden !important;';

export const hideTeamHeader = `.test-team-header {${visibilityHidden}} `;
export const hidePostHeaderTime = `.post__time {${visibilityHidden}} `;

export async function hideDynamicChannelsContent(page: Page) {
    await page.addStyleTag({content: hideTeamHeader + hidePostHeaderTime});
}
