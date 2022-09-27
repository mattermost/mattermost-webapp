// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import localForage from 'localforage';
import {AnyAction, combineReducers} from 'redux';
import {persistReducer, REHYDRATE} from 'redux-persist';

import {UserTypes} from 'mattermost-redux/action_types';

import {NewPostDraft} from 'types/store/draft';

import {ActionTypes} from 'utils/constants';

import {RelationOneToOne} from '@mattermost/types/utilities';
import {Channel} from '@mattermost/types/channels';

function byChannel(state: RelationOneToOne<Channel, NewPostDraft> = {}, action: AnyAction) {
    switch (action.type) {
    case ActionTypes.DRAFT_CONTENT_UPDATED:
        if (action.rootId) {
            return state;
        }

        return {
            ...state,
            [action.channelId]: {
                ...state[action.channelId],
                content: action.content,
            },
        };

    case REHYDRATE:
        if (!action.payload || action.key !== 'drafts.byChannel') {
            return state;
        }

        return action.payload;

    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function byThread(state: RelationOneToOne<Channel, NewPostDraft> = {}, action: AnyAction) {
    switch (action.type) {
    case ActionTypes.DRAFT_CONTENT_UPDATED:
        if (!action.rootId) {
            return state;
        }

        return {
            ...state,
            [action.rootId]: {
                ...state[action.rootId],
                content: action.content,
            },
        };

    case REHYDRATE:
        if (!action.payload || action.key !== 'drafts.byThread') {
            return state;
        }

        return action.payload;

    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export default combineReducers({
    byChannel: persistReducer({key: 'drafts.byChannel', storage: localForage}, byChannel),
    byThread: persistReducer({key: 'drafts.byThread', storage: localForage}, byThread),
});
