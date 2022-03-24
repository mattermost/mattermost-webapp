// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {
    PostTypes,
    TeamTypes,
    SearchTypes,
    UserTypes,
} from 'mattermost-redux/action_types';
import type {GenericAction} from 'mattermost-redux/types/actions';

import type {RhsState} from 'types/store/rhs';

import {ActionTypes, RHSStates} from 'utils/constants';

function selectedPostId(state = '', action: GenericAction) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        return action.postId;
    case ActionTypes.SELECT_POST_CARD:
        return '';
    case PostTypes.POST_REMOVED:
        if (action.data && action.data.id === state) {
            return '';
        }
        return state;
    case ActionTypes.UPDATE_RHS_STATE:
        return '';

    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

// selectedPostFocussedAt keeps track of the last time a post was selected, whether or not it
// is currently selected.
function selectedPostFocussedAt(state = 0, action: GenericAction) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        return action.timestamp || 0;

    case UserTypes.LOGOUT_SUCCESS:
        return 0;
    default:
        return state;
    }
}

function highlightedPostId(state = '', action: GenericAction) {
    switch (action.type) {
    case ActionTypes.HIGHLIGHT_REPLY:
        return action.postId;
    case ActionTypes.CLEAR_HIGHLIGHT_REPLY:
    case ActionTypes.UPDATE_RHS_STATE:
        return '';

    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

// filesSearchExtFilter keeps track of the extension filters used for file search.
function filesSearchExtFilter(state: string[] = [], action: GenericAction) {
    switch (action.type) {
    case ActionTypes.SET_FILES_FILTER_BY_EXT:
        return action.data;

    case UserTypes.LOGOUT_SUCCESS:
        return [];
    default:
        return state;
    }
}

function selectedPostCardId(state = '', action: GenericAction) {
    switch (action.type) {
    case ActionTypes.SELECT_POST_CARD:
        return action.postId;
    case ActionTypes.SELECT_POST:
        return '';
    case PostTypes.POST_REMOVED:
        if (action.data && action.data.id === state) {
            return '';
        }
        return state;
    case ActionTypes.UPDATE_RHS_STATE:
        return '';

    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

function selectedChannelId(state = '', action: GenericAction) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        return action.channelId;
    case ActionTypes.SELECT_POST_CARD:
        return action.channelId;
    case ActionTypes.UPDATE_RHS_STATE:
        if ([RHSStates.PIN, RHSStates.CHANNEL_FILES, RHSStates.CHANNEL_INFO].includes(action.state)) {
            return action.channelId;
        }
        return '';

    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

function previousRhsState(state: RhsState = null, action: GenericAction) {
    switch (action.type) {
    case ActionTypes.SELECT_POST:
        if (action.previousRhsState) {
            return action.previousRhsState;
        }
        return null;
    case ActionTypes.SELECT_POST_CARD:
        if (action.previousRhsState) {
            return action.previousRhsState;
        }
        return null;

    case UserTypes.LOGOUT_SUCCESS:
        return null;
    default:
        return state;
    }
}

function rhsState(state: RhsState = null, action: GenericAction) {
    switch (action.type) {
    case ActionTypes.UPDATE_RHS_STATE:
        return action.state;
    case ActionTypes.SELECT_POST:
        return null;
    case ActionTypes.SELECT_POST_CARD:
        return null;

    case UserTypes.LOGOUT_SUCCESS:
        return null;
    default:
        return state;
    }
}

function searchTerms(state = '', action: GenericAction) {
    switch (action.type) {
    case ActionTypes.UPDATE_RHS_SEARCH_TERMS:
        return action.terms;
    case ActionTypes.UPDATE_RHS_STATE:
        if (action.state !== RHSStates.SEARCH) {
            return '';
        }
        return state;
    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

function searchType(state = '', action: GenericAction) {
    switch (action.type) {
    case ActionTypes.UPDATE_RHS_SEARCH_TYPE:
        return action.searchType;
    case ActionTypes.UPDATE_RHS_STATE:
        if (action.state !== RHSStates.SEARCH) {
            return '';
        }
        return state;
    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

function pluggableId(state = '', action: GenericAction) {
    switch (action.type) {
    case ActionTypes.UPDATE_RHS_STATE:
        if (action.state === RHSStates.PLUGIN) {
            return action.pluggableId;
        }
        return '';
    case ActionTypes.SELECT_POST:
    case ActionTypes.SELECT_POST_CARD:
        return '';

    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

function searchResultsTerms(state = '', action: GenericAction) {
    switch (action.type) {
    case ActionTypes.UPDATE_RHS_SEARCH_RESULTS_TERMS:
        return action.terms;

    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

function isSearchingFlaggedPost(state = false, action: GenericAction) {
    switch (action.type) {
    case SearchTypes.SEARCH_FLAGGED_POSTS_REQUEST:
        return true;
    case SearchTypes.SEARCH_FLAGGED_POSTS_FAILURE:
    case SearchTypes.SEARCH_FLAGGED_POSTS_SUCCESS:
        return false;

    case UserTypes.LOGOUT_SUCCESS:
        return false;
    default:
        return state;
    }
}

function isSearchingPinnedPost(state = false, action: GenericAction) {
    switch (action.type) {
    case SearchTypes.SEARCH_PINNED_POSTS_REQUEST:
        return true;
    case SearchTypes.SEARCH_PINNED_POSTS_FAILURE:
    case SearchTypes.SEARCH_PINNED_POSTS_SUCCESS:
        return false;

    case UserTypes.LOGOUT_SUCCESS:
        return false;
    default:
        return state;
    }
}

function isSidebarOpen(state = false, action: GenericAction) {
    switch (action.type) {
    case ActionTypes.UPDATE_RHS_STATE:
        return Boolean(action.state);
    case ActionTypes.SELECT_POST:
        return Boolean(action.postId);
    case ActionTypes.SELECT_POST_CARD:
        return Boolean(action.postId);
    case ActionTypes.TOGGLE_RHS_MENU:
        return false;
    case ActionTypes.OPEN_RHS_MENU:
        return false;
    case ActionTypes.TOGGLE_LHS:
        return false;
    case ActionTypes.OPEN_LHS:
        return false;

    case UserTypes.LOGOUT_SUCCESS:
        return false;
    default:
        return state;
    }
}

function isSidebarExpanded(state = false, action: GenericAction) {
    switch (action.type) {
    case ActionTypes.SET_RHS_EXPANDED:
        return action.expanded;
    case ActionTypes.TOGGLE_RHS_EXPANDED:
        return !state;
    case ActionTypes.UPDATE_RHS_STATE:
        return action.state ? state : false;
    case ActionTypes.SELECT_POST:
        return action.postId ? state : false;
    case ActionTypes.SELECT_POST_CARD:
        return action.postId ? state : false;
    case ActionTypes.TOGGLE_RHS_MENU:
        return false;
    case ActionTypes.SUPPRESS_RHS:
        return false;
    case ActionTypes.OPEN_RHS_MENU:
        return false;
    case ActionTypes.TOGGLE_LHS:
        return false;
    case ActionTypes.OPEN_LHS:
        return false;
    case TeamTypes.SELECT_TEAM:
        return false;

    case UserTypes.LOGOUT_SUCCESS:
        return false;
    default:
        return state;
    }
}

function isMenuOpen(state = false, action: GenericAction) {
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

    case UserTypes.LOGOUT_SUCCESS:
        return false;
    default:
        return state;
    }
}

export default combineReducers({
    selectedPostId,
    selectedPostFocussedAt,
    selectedPostCardId,
    selectedChannelId,
    highlightedPostId,
    previousRhsState,
    filesSearchExtFilter,
    rhsState,
    searchTerms,
    searchType,
    searchResultsTerms,
    pluggableId,
    isSearchingFlaggedPost,
    isSearchingPinnedPost,
    isSidebarOpen,
    isSidebarExpanded,
    isMenuOpen,
});
