// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getItem} from 'selectors/storage';

import {GlobalState} from 'types/store';

import {StoragePrefixes} from 'utils/constants';

export function isCategoryCollapsedFromStorage(state: GlobalState, categoryId: string) {
    return getItem(state, StoragePrefixes.CHANNEL_CATEGORY_COLLAPSED + categoryId, false);
}

export function isCategoryCollapsed(state: GlobalState, categoryId: string) {
    return isUnreadFilterEnabled(state) || isCategoryCollapsedFromStorage(state, categoryId);
}

export function isUnreadFilterEnabled(state: GlobalState) {
    return state.views.channelSidebar.unreadFilterEnabled;
}
