// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {setItem} from 'actions/storage';

import {ActionTypes, StoragePrefixes} from 'utils/constants';

export function collapseCategory(categoryId: string) {
    return setItem(StoragePrefixes.CHANNEL_CATEGORY_COLLAPSED + categoryId, true);
}

export function expandCategory(categoryId: string) {
    // This would ideally remove the item, but that doesn't work for some reason
    return setItem(StoragePrefixes.CHANNEL_CATEGORY_COLLAPSED + categoryId, false);
}

export function setCategoryCollapsed(categoryId: string, collapsed: boolean) {
    if (collapsed) {
        return collapseCategory(categoryId);
    }

    return expandCategory(categoryId);
}

export function setUnreadFilterEnabled(enabled: boolean) {
    return {
        type: ActionTypes.SET_UNREAD_FILTER_ENABLED,
        enabled,
    };
}
