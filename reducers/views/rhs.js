// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';

import {PostTypes} from 'mattermost-redux/action_types';

import {ActionTypes} from 'utils/constants.jsx';

function selectedPostId(state = '', action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        return action.postId;
    case PostTypes.REMOVE_POST:
        if (action.data && action.data.id === state) {
            return '';
        }
        return state;
    default:
        return state;
    }
}

function selectedPostChannelId(state = '', action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        return action.channelId;
    default:
        return state;
    }
}

function fromSearch(state = '', action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        if (action.from_search) {
            return action.from_search;
        }
        return '';
    default:
        return state;
    }
}

function fromFlaggedPosts(state = false, action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        if (action.from_flagged_posts) {
            return action.from_flagged_posts;
        }
        return false;
    default:
        return state;
    }
}

function fromPinnedPosts(state = false, action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        if (action.from_pinned_posts) {
            return action.from_pinned_posts;
        }
        return false;
    default:
        return state;
    }
}

export default combineReducers({
    selectedPostId,
    selectedPostChannelId,
    fromSearch,
    fromFlaggedPosts,
    fromPinnedPosts
});
