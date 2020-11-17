// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createCategory as createCategoryRedux, moveChannelToCategory} from 'mattermost-redux/actions/channel_categories';
import {getCategory, makeGetChannelsForCategory} from 'mattermost-redux/selectors/entities/channel_categories';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';
import {insertWithoutDuplicates} from 'mattermost-redux/utils/array_utils';

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

// moveChannelInSidebar moves a channel to a given category in the sidebar, but it accounts for when the target index
// may have changed due to archived channels not being shown in the sidebar.
export function moveChannelInSidebar(categoryId: string, channelId: string, targetIndex: number) {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const newIndex = adjustTargetIndexForMove(getState(), categoryId, channelId, targetIndex);

        return dispatch(moveChannelToCategory(categoryId, channelId, newIndex));
    };
}

export function adjustTargetIndexForMove(state: GlobalState, categoryId: string, channelId: string, targetIndex: number) {
    if (targetIndex === 0) {
        // The channel is being placed first, so there's nothing above that could affect the index
        return 0;
    }

    const category = getCategory(state, categoryId);
    const filteredChannels = makeGetChannelsForCategory()(state, category);

    if (category.channel_ids.length === filteredChannels.length) {
        // There are no archived channels in the category, so the targetIndex from react-beautiful-dnd will be correct
        return targetIndex;
    }

    const filteredChannelIds = filteredChannels.map((channel) => channel.id);
    const updatedChannelIds = insertWithoutDuplicates(filteredChannelIds, channelId, targetIndex);

    // After "moving" the channel in the sidebar, find what channel comes above it
    const previousChannelId = updatedChannelIds[updatedChannelIds.indexOf(channelId) - 1];

    // We want the channel to still be below that channel, so place the new index below it
    let newIndex = category.channel_ids.indexOf(previousChannelId) + 1;

    // If the channel is moving downwards, then the target index will need to be reduced by one to account for
    // the channel being removed. For example, if we're moving channelA from [channelA, channelB, channelC] to
    // [channelB, channelA, channelC], newIndex would currently be 2 (which comes after channelB), but we need
    // it to be 1 (which comes after channelB once channelA is removed).
    const sourceIndex = category.channel_ids.indexOf(channelId);
    if (sourceIndex !== -1 && sourceIndex < newIndex) {
        newIndex -= 1;
    }

    return newIndex;
}
