// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {favoriteChannel, unfavoriteChannel} from 'mattermost-redux/actions/channels';
import {ChannelCategoryTypes} from 'mattermost-redux/action_types';
import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {makeGetChannelsForCategory, makeGetCategoriesForTeam, getCategoryIdsForTeam} from 'mattermost-redux/selectors/entities/channel_categories';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {setItem} from 'actions/storage';
import {makeGetCategoryForChannel} from 'selectors/views/channel_sidebar';
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

// TODO Devin: Replace with `moveChannelToCategory`
export function setCategoryOrder(teamId: string, categoryId: string, channelId: string, newIndex: number) {
    const getChannelsForCategory = makeGetChannelsForCategory();
    const getCategoriesForTeam = makeGetCategoriesForTeam();

    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const category = getCategoriesForTeam(getState(), teamId).find((c) => c.id === categoryId);
        if (!category) {
            return {error: 'no_category'};
        }

        const currentChannels = getChannelsForCategory(getState(), category);
        const channelIds = currentChannels.map((channel) => channel.id);

        if (channelIds.includes(channelId)) {
            channelIds.splice(channelIds.indexOf(channelId), 1);
        } else if (category.type === CategoryTypes.FAVORITES) {
            dispatch(favoriteChannel(channelId));
        }

        channelIds.splice(newIndex, 0, channelId);

        // TODO: Will need to call an actual redux action so that this also goes to the server
        // But for now, this will update the redux state correctly.
        return dispatch({type: ChannelCategoryTypes.RECEIVED_CATEGORY, data: {...category, channel_ids: channelIds}});
    };
}

// TODO Devin: Replace with `moveCategory`
export function setCategoriesOrder(teamId: string, categoryId: string, newIndex: number) {
    const getCategoriesForTeam = makeGetCategoriesForTeam();

    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const currentCategories = getCategoriesForTeam(getState(), teamId);
        const categoryIds = currentCategories.map((category) => category.id);

        if (categoryIds.includes(categoryId)) {
            categoryIds.splice(categoryIds.indexOf(categoryId), 1);
        }

        categoryIds.splice(newIndex, 0, categoryId);

        // TODO: Will need to call an actual redux action so that this also goes to the server
        // But for now, this will update the redux state correctly.
        dispatch({type: ChannelCategoryTypes.RECEIVED_CATEGORY_ORDER, data: {teamId, categoryIds}});
    };
}

// TODO Devin: Remove, should not be needed
export function removeFromCategory(teamId: string, categoryId: string, channelId: string) {
    const getChannelsForCategory = makeGetChannelsForCategory();
    const getCategoriesForTeam = makeGetCategoriesForTeam();

    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const category = getCategoriesForTeam(getState(), teamId).find((c) => c.id === categoryId);
        if (!category) {
            return {error: 'no_category'};
        }

        const currentChannels = getChannelsForCategory(getState(), category);
        const channelIds = currentChannels.map((channel) => channel.id);

        if (channelIds.includes(channelId)) {
            channelIds.splice(channelIds.indexOf(channelId), 1);
        }

        if (category.type === CategoryTypes.FAVORITES) {
            dispatch(unfavoriteChannel(channelId));
        }

        // TODO: Will need to call an actual redux action so that this also goes to the server
        // But for now, this will update the redux state correctly.
        return dispatch({type: ChannelCategoryTypes.RECEIVED_CATEGORY, data: {...category, channel_ids: channelIds}});
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

// TODO Devin: Replace with `addChannelToCategory`
export function moveToCategory(teamId: string, channelId: string, newCategoryId: string) {
    const getCategoryForChannel = makeGetCategoryForChannel();

    return (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const currentCategory = getCategoryForChannel(getState(), teamId, channelId);

        if (currentCategory) {
            dispatch(removeFromCategory(teamId, currentCategory.id, channelId));
        }

        dispatch(setCategoryOrder(teamId, newCategoryId, channelId, 0));
    };
}

// TODO Devin: Replace with `createCategory`
export function mockCreateCategory(teamId: string, categoryName: string) {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        dispatch({
            type: ChannelCategoryTypes.RECEIVED_CATEGORY,
            data: {
                id: `${teamId}-${categoryName}`,
                team_id: teamId,
                type: CategoryTypes.CUSTOM,
                display_name: categoryName,
                channel_ids: [],
            },
        });

        const currentCategoryIds = Array.from(getCategoryIdsForTeam(getState(), teamId)!);
        const indexOfFavorites = currentCategoryIds.findIndex((id) => id.includes('favorites'));
        currentCategoryIds.splice(indexOfFavorites || 1, 0, `${teamId}-${categoryName}`);

        dispatch({
            type: ChannelCategoryTypes.RECEIVED_CATEGORY_ORDER,
            data: {
                teamId,
                categoryIds: currentCategoryIds,
            },
        });

        dispatch({
            type: ActionTypes.ADD_NEW_CATEGORY_ID,
            data: `${teamId}-${categoryName}`,
        });

        return {data: `${teamId}-${categoryName}`};
    };
}
