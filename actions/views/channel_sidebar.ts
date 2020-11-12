// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createCategory as createCategoryRedux, moveChannelsToCategory} from 'mattermost-redux/actions/channel_categories';
import {getCategory, makeGetChannelsForCategory} from 'mattermost-redux/selectors/entities/channel_categories';
import {DispatchFunc} from 'mattermost-redux/types/actions';
import {insertMultipleWithoutDuplicates} from 'mattermost-redux/utils/array_utils';

import {setItem} from 'actions/storage';
import {getChannelsInCategoryOrder} from 'selectors/views/channel_sidebar';
import {DraggingState, GlobalState} from 'types/store';
import {ActionTypes, StoragePrefixes} from 'utils/constants';
import { target } from 'webpack.config';

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
export function moveChannelsInSidebar(categoryId: string, channelIds: string[], targetIndex: number, draggableChannelId: string) {
    return (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const newIndex = adjustTargetIndexForMove(getState(), categoryId, channelIds, targetIndex, draggableChannelId);

        return dispatch(moveChannelsToCategory(categoryId, channelIds, newIndex));
    };
}

export function adjustTargetIndexForMove(state: GlobalState, categoryId: string, channelIds: string[], targetIndex: number, draggableChannelId: string) {
    if (targetIndex === 0) {
        // The channel is being placed first, so there's nothing above that could affect the index
        return 0;
    }

    const category = getCategory(state, categoryId);
    const filteredChannels = makeGetChannelsForCategory()(state, category);
    const filteredChannelIds = filteredChannels.map((channel) => channel.id);

    // When dragging multiple channels, we don't actually remove all of them from the list as react-beautiful-dnd doesn't support that
    // Account for channels removed above the insert point, except the one currently being dragged which is already accounted for by react-beautiful-dnd
    const removedChannelsAboveInsert = filteredChannelIds.filter((channel, index) => channel !== draggableChannelId && channelIds.indexOf(channel) !== -1 && index <= targetIndex);

    if (category.channel_ids.length === filteredChannels.length) {
        // There are no archived channels in the category, so the targetIndex from react-beautiful-dnd will be correct
        return targetIndex - removedChannelsAboveInsert.length;
    }

    const updatedChannelIds = insertMultipleWithoutDuplicates(filteredChannelIds, channelIds, targetIndex - removedChannelsAboveInsert.length);

    // After "moving" the channel in the sidebar, find what channel comes above it
    const previousChannelId = updatedChannelIds[updatedChannelIds.indexOf(channelIds[0]) - 1];

    // We want the channel to still be below that channel, so place the new index below it
    let newIndex = category.channel_ids.indexOf(previousChannelId) + 1;

    // If the channel is moving downwards, then the target index will need to be reduced by one to account for
    // the channel being removed. For example, if we're moving channelA from [channelA, channelB, channelC] to
    // [channelB, channelA, channelC], newIndex would currently be 2 (which comes after channelB), but we need
    // it to be 1 (which comes after channelB once channelA is removed).
    const sourceIndex = category.channel_ids.indexOf(channelIds[0]);
    if (sourceIndex !== -1 && sourceIndex < newIndex) {
        newIndex -= 1;
    }

    return Math.max(newIndex - removedChannelsAboveInsert.length, 0);
}

export function clearChannelSelection() {
    return (dispatch: DispatchFunc) => {
        return dispatch({
            type: ActionTypes.MULTISELECT_CHANNEL_CLEAR,
        });
    };
}

export function multiSelectChannel(channelId: string) {
    return {
        type: ActionTypes.MULTISELECT_CHANNEL,
        data: channelId,
    };
}

export function multiSelectChannelAdd(channelId: string) {
    return {
        type: ActionTypes.MULTISELECT_CHANNEL_ADD,
        data: channelId,
    };
}

export function multiSelectChannelTo(channelId: string) {
    return (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state: GlobalState = getState();
        const selectedChannelIds = state.views.channelSidebar.selectedChannelIds;
        const lastSelected = state.views.channelSidebar.lastSelectedChannel;

        // Nothing already selected
        if (!selectedChannelIds.length) {
            return dispatch({
                type: ActionTypes.MULTISELECT_CHANNEL,
                data: channelId,
            });
        }

        const allChannelsIdsInOrder = getChannelsInCategoryOrder(state).map((channel) => channel.id);
        const indexOfNew: number = allChannelsIdsInOrder.indexOf(channelId);
        const indexOfLast: number = allChannelsIdsInOrder.indexOf(lastSelected);

        // multi selecting in the same column
        // need to select everything between the last index and the current index inclusive

        // nothing to do here
        if (indexOfNew === indexOfLast) {
            return null;
        }

        const isSelectingForwards: boolean = indexOfNew > indexOfLast;
        const start: number = isSelectingForwards ? indexOfLast : indexOfNew;
        const end: number = isSelectingForwards ? indexOfNew : indexOfLast;

        const inBetween = allChannelsIdsInOrder.slice(start, end + 1);

        // everything inbetween needs to have it's selection toggled.
        // with the exception of the start and end values which will always be selected

        return dispatch({
            type: ActionTypes.MULTISELECT_CHANNEL_TO,
            data: inBetween,
        });
    };
}
