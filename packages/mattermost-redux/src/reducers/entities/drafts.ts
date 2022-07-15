// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {DraftTypes} from 'mattermost-redux/action_types';
import {GenericAction} from 'mattermost-redux/types/actions';

import {Draft} from '@mattermost/types/drafts';

const initialState: Draft[] = [];

function drafts(state = initialState, action: GenericAction) {
    switch (action.type) {
    case DraftTypes.GET_USER_DRAFTS:
        return action.payload || [];
    case DraftTypes.UPDATE_USER_DRAFT: {
        const {channel_id: channelId, root_id: rootId} = action.payload;
        const index = state.findIndex((dr) =>
            channelId === dr.channel_id && rootId === dr.root_id,
        );

        if (index === -1) {
            return [
                action.payload,
                ...state,
            ];
        }

        return [
            action.payload,
            ...state.slice(0, index),
            ...state.slice(index + 1),
        ];
    }
    case DraftTypes.CREATE_USER_DRAFT:
        return [
            action.payload,
            ...state,
        ];
    case DraftTypes.DELETE_USER_DRAFT: {
        const {channelId, rootId} = action.payload;
        const index = state.findIndex((dr) =>
            channelId === dr.channel_id && rootId === dr.root_id,
        );
        if (index === -1) {
            return state;
        }

        return [
            ...state.slice(0, index),
            ...state.slice(index + 1),
        ];
    }
    default:
        return state;
    }
}

export default combineReducers({
    drafts,
});
