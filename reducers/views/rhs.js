// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {PostTypes, SearchTypes, TeamTypes} from 'mattermost-redux/action_types';

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

function selectedChannelId(state = '', action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        return action.channelId;
    case ActionTypes.UPDATE_RHS_STATE:
        if (action.state === RHSStates.PIN) {
            return action.channelId;
        }
        return '';
    default:
        return state;
    }
}

function previousRhsState(state = null, action) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        if (action.previousRhsState) {
            return action.previousRhsState;
        }
        return null;
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

function searchResultsTerms(state = '', action) {
    switch (action.type) {
    case ActionTypes.UPDATE_RHS_SEARCH_RESULTS_TERMS:
        return action.terms;
    default:
        return state;
    }
}

function isSearchingTerm(state = false, action) {
    switch (action.type) {
    case SearchTypes.SEARCH_POSTS_REQUEST:
        return true;
    case SearchTypes.SEARCH_POSTS_FAILURE:
    case SearchTypes.SEARCH_POSTS_SUCCESS:
        return false;
    default:
        return state;
    }
}

function isSearchingFlaggedPost(state = false, action) {
    switch (action.type) {
    case ActionTypes.SEARCH_FLAGGED_POSTS_REQUEST:
        return true;
    case ActionTypes.SEARCH_FLAGGED_POSTS_FAILURE:
    case ActionTypes.SEARCH_FLAGGED_POSTS_SUCCESS:
        return false;
    default:
        return state;
    }
}

function isSearchingPinnedPost(state = false, action) {
    switch (action.type) {
    case ActionTypes.SEARCH_PINNED_POSTS_REQUEST:
        return true;
    case ActionTypes.SEARCH_PINNED_POSTS_FAILURE:
    case ActionTypes.SEARCH_PINNED_POSTS_SUCCESS:
        return false;
    default:
        return state;
    }
}

function isSidebarOpen(state = false, action) {
    switch (action.type) {
    case ActionTypes.UPDATE_RHS_STATE:
        return Boolean(action.state);
    case ActionTypes.SELECT_POST:
        return Boolean(action.postId);
    case ActionTypes.TOGGLE_RHS_MENU:
        return false;
    case ActionTypes.OPEN_RHS_MENU:
        return false;
    case ActionTypes.TOGGLE_LHS:
        return false;
    case ActionTypes.OPEN_LHS:
        return false;
    case TeamTypes.SELECT_TEAM:
        return false;
    default:
        return state;
    }
}

function isMenuOpen(state = false, action) {
    switch (action.type) {
    case ActionTypes.TOGGLE_RHS_MENU:
        return !state;
    case ActionTypes.OPEN_RHS_MENU:
        return true;
    case ActionTypes.CLOSE_RHS_MENU:
        return false;
    case ActionTypes.TOGGLE_LHS:
        return false;
    case ActionTypes.OPEN_LHS:
        return false;
    case TeamTypes.SELECT_TEAM:
        return false;
    default:
        return state;
    }
}

export default combineReducers({
    selectedPostId,
    selectedChannelId,
    previousRhsState,
    rhsState,
    searchTerms,
    searchResultsTerms,
    isSearchingTerm,
    isSearchingFlaggedPost,
    isSearchingPinnedPost,
    isSidebarOpen,
    isMenuOpen,
});
