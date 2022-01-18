// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import localforage from 'localforage';
import {AnyAction} from 'redux';
import {persistCombineReducers} from 'redux-persist';

import {Channel} from 'mattermost-redux/types/channels';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';

import {PostDraft} from 'types/drafts';

import {ActionTypes} from 'utils/constants';
import {isDraftEmpty} from 'utils/drafts';

function commentDrafts(state: RelationOneToOne<Channel, PostDraft> = {}, action: AnyAction) {
    switch (action.type) {
    case ActionTypes.COMMENT_DRAFT_UPDATED: {
        const {rootId, draft} = action;

        if (isDraftEmpty(draft)) {
            if (state[rootId]) {
                const nextState = {...state};

                Reflect.deleteProperty(nextState, rootId);

                return nextState;
            }

            return state;
        }

        return {
            ...state,
            [action.rootId]: action.draft,
        };
    }
    default:
        return state;
    }
}

function postDrafts(state: RelationOneToOne<Channel, PostDraft> = {}, action: AnyAction) {
    switch (action.type) {
    case ActionTypes.POST_DRAFT_UPDATED: {
        const {channelId, draft} = action;

        if (isDraftEmpty(draft)) {
            if (state[channelId]) {
                const nextState = {...state};

                Reflect.deleteProperty(nextState, channelId);

                return nextState;
            }

            return state;
        }

        return {
            ...state,
            [action.channelId]: action.draft,
        };
    }
    default:
        return state;
    }
}

export default persistCombineReducers(
    {
        key: 'drafts',
        storage: localforage,
    },
    {
        commentDrafts,

        postDrafts,
    },
);
