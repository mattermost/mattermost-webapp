// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {ChannelCategoryTypes, UserTypes} from 'mattermost-redux/action_types';

import {GenericAction} from 'mattermost-redux/types/actions';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';

import {removeItem} from 'mattermost-redux/utils/array_utils';

import {DraggingState} from 'types/store';

import {ActionTypes} from 'utils/constants';

export function unreadFilterEnabled(state = false, action: GenericAction) {
    switch (action.type) {
    case ActionTypes.SET_UNREAD_FILTER_ENABLED:
        return action.enabled;

    case UserTypes.LOGOUT_SUCCESS:
        return false;
    default:
        return state;
    }
}

export function draggingState(state: DraggingState = {}, action: GenericAction): DraggingState {
    switch (action.type) {
    case ActionTypes.SIDEBAR_DRAGGING_SET_STATE:
        return {
            state: action.data.state || state?.state,
            type: action.data.type || state?.type,
            id: action.data.id || state?.id,
        };

    case ActionTypes.SIDEBAR_DRAGGING_STOP:
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export function newCategoryIds(state: string[] = [], action: GenericAction): string[] {
    switch (action.type) {
    case ActionTypes.ADD_NEW_CATEGORY_ID:
        return [...state, action.data];
    case ChannelCategoryTypes.RECEIVED_CATEGORY: {
        const category: ChannelCategory = action.data;

        if (category.channel_ids.length > 0) {
            return removeItem(state, category.id);
        }

        return state;
    }
    case ChannelCategoryTypes.RECEIVED_CATEGORIES: {
        const categories = action.data;

        return categories.reduce((nextState: string[], category: ChannelCategory) => {
            if (category.channel_ids.length > 0) {
                return removeItem(nextState, category.id);
            }

            return nextState;
        }, state);
    }

    case UserTypes.LOGOUT_SUCCESS:
        return [];
    default:
        return state;
    }
}

export default combineReducers({
    unreadFilterEnabled,
    draggingState,
    newCategoryIds,
});
