// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createCategory as createCategoryRedux, moveChannelsToCategory} from 'mattermost-redux/actions/channel_categories';
import {General} from 'mattermost-redux/constants';
import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {getCategory, makeGetChannelsForCategory} from 'mattermost-redux/selectors/entities/channel_categories';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {DispatchFunc} from 'mattermost-redux/types/actions';
import {insertMultipleWithoutDuplicates} from 'mattermost-redux/utils/array_utils';

import {setItem} from 'actions/storage';
import {getCategoriesForCurrentTeam, getChannelsInCategoryOrder, getDisplayedChannels} from 'selectors/views/channel_sidebar';
import {DraggingState, GlobalState} from 'types/store';
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
export function moveChannelsInSidebar(categoryId: string, targetIndex: number, draggableChannelId: string) {
    return (dispatch: (action: (dispatch: DispatchFunc, getState: () => GlobalState) => Promise<ActionResult>) => Promise<ActionResult>, getState: () => GlobalState) => {
        const state = getState();
        const multiSelectedChannelIds = state.views.channelSidebar.multiSelectedChannelIds;
        let channelIds = [];

        // Multi channel case
        if (multiSelectedChannelIds.length) {
            const categories = getCategoriesForCurrentTeam(state);
            const displayedChannels = getDisplayedChannels(state);

            let channelsToMove = [draggableChannelId];

            // Filter out channels that can't go in the category specified
            const targetCategory = categories.find((category) => category.id === categoryId);
            channelsToMove = multiSelectedChannelIds.filter((channelId) => {
                const selectedChannel = displayedChannels.find((channel) => channelId === channel.id);
                const isDMGM = selectedChannel?.type === General.DM_CHANNEL || selectedChannel?.type === General.GM_CHANNEL;
                return targetCategory?.type === CategoryTypes.CUSTOM || (isDMGM && targetCategory?.type === CategoryTypes.DIRECT_MESSAGES) || (!isDMGM && targetCategory?.type !== CategoryTypes.DIRECT_MESSAGES);
            });

            // Reorder such that the channels move in the order that they appear in the sidebar
            const displayedChannelIds = displayedChannels.map((channel) => channel.id);
            channelsToMove.sort((a, b) => displayedChannelIds.indexOf(a) - displayedChannelIds.indexOf(b));

            // Remove selection from channels that were moved
            channelsToMove.forEach((channelId) => dispatch(multiSelectChannelAdd(channelId)));
            channelIds = channelsToMove;
        } else {
            channelIds = [draggableChannelId];
        }

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
    const shiftedIndex = targetIndex - removedChannelsAboveInsert.length;

    if (category.channel_ids.length === filteredChannels.length) {
        // There are no archived channels in the category, so the shiftedIndex will be correct
        return shiftedIndex;
    }

    const updatedChannelIds = insertMultipleWithoutDuplicates(filteredChannelIds, channelIds, shiftedIndex);

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
    return (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();

        if (state.views.channelSidebar.multiSelectedChannelIds.length === 0) {
            // No selection to clear
            return Promise.resolve({data: true});
        }

        return dispatch({
            type: ActionTypes.MULTISELECT_CHANNEL_CLEAR,
        });
    };
}

export function multiSelectChannelAdd(channelId: string) {
    return (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state: GlobalState = getState();
        const multiSelectedChannelIds = state.views.channelSidebar.multiSelectedChannelIds;

        // Nothing already selected, so we include the active channel
        if (!multiSelectedChannelIds.length) {
            const currentChannel = getCurrentChannelId(state);
            dispatch({
                type: ActionTypes.MULTISELECT_CHANNEL,
                data: currentChannel,
            });
        }

        return dispatch({
            type: ActionTypes.MULTISELECT_CHANNEL_ADD,
            data: channelId,
        });
    };
}

// Much of this logic was pulled from the react-beautiful-dnd sample multiselect implementation
// Found here: https://github.com/atlassian/react-beautiful-dnd/tree/master/stories/src/multi-drag
export function multiSelectChannelTo(channelId: string) {
    return (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state: GlobalState = getState();
        const multiSelectedChannelIds = state.views.channelSidebar.multiSelectedChannelIds;
        let lastSelected = state.views.channelSidebar.lastSelectedChannel;

        // Nothing already selected, so start with the active channel
        if (!multiSelectedChannelIds.length) {
            const currentChannel = getCurrentChannelId(state);
            dispatch({
                type: ActionTypes.MULTISELECT_CHANNEL,
                data: currentChannel,
            });
            lastSelected = currentChannel;
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

        const start: number = Math.min(indexOfLast, indexOfNew);
        const end: number = Math.max(indexOfLast, indexOfNew);

        const inBetween = allChannelsIdsInOrder.slice(start, end + 1);

        // everything inbetween needs to have it's selection toggled.
        // with the exception of the start and end values which will always be selected

        return dispatch({
            type: ActionTypes.MULTISELECT_CHANNEL_TO,
            data: inBetween,
        });
    };
}
