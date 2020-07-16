// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createCategory as createCategoryRedux} from 'mattermost-redux/actions/channel_categories';
import {DispatchFunc} from 'mattermost-redux/types/actions';

import {setItem} from 'actions/storage';
import {DraggingState} from 'types/store';
import {ActionTypes, StoragePrefixes} from 'utils/constants';

export function collapseCategory(categoryId: string) {
    return setItem(StoragePrefixes.CHANNEL_CATEGORY_COLLAPSED + categoryId, true);
}

export function expandCategory(categoryId: string) {
    // You should be able to use removeItem here, but removeItem was not working at all
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

export function setDraggingState(data: DraggingState) {
    return {
        type: ActionTypes.SIDEBAR_DRAGGING_SET_STATE,
        data,
    };
}

export function stopDragging() {
    return {type: ActionTypes.SIDEBAR_DRAGGING_STOP};
}

export function createCategory(teamId: string, displayName: string, channelIds?: string[]) {
    return async (dispatch: DispatchFunc) => {
        const result: any = await dispatch(createCategoryRedux(teamId, displayName, channelIds));
        return dispatch({
            type: ActionTypes.ADD_NEW_CATEGORY_ID,
            data: result.data.id,
        });
    };
}
