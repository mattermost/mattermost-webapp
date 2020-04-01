// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChannelCategoryTypes} from 'mattermost-redux/action_types';
import {makeGetChannelsForCategory, makeGetCategoriesForTeam} from 'mattermost-redux/selectors/entities/channel_categories';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {setItem} from 'actions/storage';
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

export function setCategoryOrder(teamId: string, categoryId: string, channelId: string, newIndex: number) {
    const getChannelsForCategory = makeGetChannelsForCategory();
    const getCategoriesForTeam = makeGetCategoriesForTeam();

    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const category = getCategoriesForTeam(getState(), teamId).find((c) => c.id === categoryId);
        if (!category) {
            return;
        }

        const currentChannels = getChannelsForCategory(getState(), category);
        const channelIds = currentChannels.map((channel) => channel.id);

        if (channelIds.includes(channelId)) {
            channelIds.splice(channelIds.indexOf(channelId), 1);
        }

        channelIds.splice(newIndex, 0, channelId);

        // TODO: Will need to call an actual redux action so that this also goes to the server
        // But for now, this will update the redux state correctly.
        dispatch({type: ChannelCategoryTypes.RECEIVED_CATEGORY, data: {...category, channel_ids: channelIds}});
    };
}

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

export function removeFromCategory(teamId: string, categoryId: string, channelId: string) {
    const getChannelsForCategory = makeGetChannelsForCategory();
    const getCategoriesForTeam = makeGetCategoriesForTeam();

    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const category = getCategoriesForTeam(getState(), teamId).find((c) => c.id === categoryId);
        if (!category) {
            return;
        }

        const currentChannels = getChannelsForCategory(getState(), category);
        const channelIds = currentChannels.map((channel) => channel.id);

        if (channelIds.includes(channelId)) {
            channelIds.splice(channelIds.indexOf(channelId), 1);
        }

        // TODO: Will need to call an actual redux action so that this also goes to the server
        // But for now, this will update the redux state correctly.
        dispatch({type: ChannelCategoryTypes.RECEIVED_CATEGORY, data: {...category, channel_ids: channelIds}});
    };
}
