// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';

import {PostTypes} from 'mattermost-redux/action_types';

import {ActionTypes, RHSStates} from 'utils/constants.jsx';

function selectedPostId(state = '', action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        return action.postId;
    case PostTypes.REMOVE_POST:
        if (action.data && action.data.id === state) {
            return '';
        }
        return state;
    case ActionTypes.UPDATE_RHS_STATE:
        return '';
    default:
        return state;
    }
}

function channelId(state = '', action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        return action.channelId;
    case ActionTypes.UPDATE_RHS_STATE:
        if (action.state === RHSStates.PIN) {
            return action.channelId;
        }
        return null;
    default:
        return state;
    }
}

function fromSearch(state = false, action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        if (action.fromSearch) {
            return action.fromSearch;
        }
        return false;
    case ActionTypes.UPDATE_RHS_STATE:
        return false;
    default:
        return state;
    }
}

function fromFlaggedPosts(state = false, action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        if (action.fromFlaggedPosts) {
            return action.fromFlaggedPosts;
        }
        return false;
    case ActionTypes.UPDATE_RHS_STATE:
        return false;
    default:
        return state;
    }
}

function fromPinnedPosts(state = false, action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        if (action.fromPinnedPosts) {
            return action.fromPinnedPosts;
        }
        return false;
    case ActionTypes.UPDATE_RHS_STATE:
        return false;
    default:
        return state;
    }
}

function fromMentions(state = false, action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        if (action.fromMentions) {
            return action.fromMentions;
        }
        return false;
    case ActionTypes.UPDATE_RHS_STATE:
        return false;
    default:
        return state;
    }
}

function rhsState(state = null, action) {
    switch (action.type) {
    case ActionTypes.UPDATE_RHS_STATE:
        return action.state;
    case ActionTypes.SELECT_POST:
        return null;
    default:
        return state;
    }
}

function searchTerms(state = '', action) {
    switch (action.type) {
    case ActionTypes.UPDATE_RHS_SEARCH_TERMS:
        return action.terms;
    default:
        return state;
    }
}

export default combineReducers({
    selectedPostId,
    channelId,
    fromSearch,
    fromFlaggedPosts,
    fromPinnedPosts,
    fromMentions,
    rhsState,
    searchTerms
});
