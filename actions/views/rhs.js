// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {SearchTypes} from 'mattermost-redux/action_types';
import {
    clearSearch,
    getFlaggedPosts,
    getPinnedPosts,
    searchPostsWithParams,
} from 'mattermost-redux/actions/search';
import * as PostActions from 'mattermost-redux/actions/posts';
import {getCurrentUserId, getCurrentUserMentionKeys} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getUserTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getUserCurrentTimezone} from 'mattermost-redux/utils/timezone_utils';

import {trackEvent} from 'actions/telemetry_actions.jsx';
import {getSearchTerms, getRhsState, getPluggableId} from 'selectors/rhs';
import {ActionTypes, RHSStates} from 'utils/constants';
import * as Utils from 'utils/utils';

import {getBrowserUtcOffset, getUtcOffsetForTimeZone} from 'utils/timezone';

function selectPostFromRightHandSideSearchWithPreviousState(post, previousRhsState) {
    return async (dispatch, getState) => {
        const postRootId = Utils.getRootId(post);
        await dispatch(PostActions.getPostThread(postRootId));

        dispatch({
            type: ActionTypes.SELECT_POST,
            postId: postRootId,
            channelId: post.channel_id,
            previousRhsState: previousRhsState || getRhsState(getState()),
            timestamp: Date.now(),
        });
    };
}

function selectPostCardFromRightHandSideSearchWithPreviousState(post, previousRhsState) {
    return async (dispatch, getState) => {
        dispatch({
            type: ActionTypes.SELECT_POST_CARD,
            postId: post.id,
            channelId: post.channel_id,
            previousRhsState: previousRhsState || getRhsState(getState()),
        });
    };
}

export function updateRhsState(rhsState, channelId) {
    return (dispatch, getState) => {
        const action = {
            type: ActionTypes.UPDATE_RHS_STATE,
            state: rhsState,
        };

        if (rhsState === RHSStates.PIN) {
            action.channelId = channelId || getCurrentChannelId(getState());
        }

        dispatch(action);
    };
}

export function selectPostFromRightHandSideSearch(post) {
    return selectPostFromRightHandSideSearchWithPreviousState(post);
}

export function selectPostCardFromRightHandSideSearch(post) {
    return selectPostCardFromRightHandSideSearchWithPreviousState(post);
}

export function selectPostFromRightHandSideSearchByPostId(postId) {
    return async (dispatch, getState) => {
        const post = getPost(getState(), postId);
        return selectPostFromRightHandSideSearch(post)(dispatch, getState);
    };
}

export function updateSearchTerms(terms) {
    return {
        type: ActionTypes.UPDATE_RHS_SEARCH_TERMS,
        terms,
    };
}

function updateSearchResultsTerms(terms) {
    return {
        type: ActionTypes.UPDATE_RHS_SEARCH_RESULTS_TERMS,
        terms,
    };
}

export function performSearch(terms, isMentionSearch) {
    return (dispatch, getState) => {
        const teamId = getCurrentTeamId(getState());
        const config = getConfig(getState());
        const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';

        // timezone offset in seconds
        const userId = getCurrentUserId(getState());
        const userTimezone = getUserTimezone(getState(), userId);
        const userCurrentTimezone = getUserCurrentTimezone(userTimezone);
        const timezoneOffset = (userCurrentTimezone.length > 0 ? getUtcOffsetForTimeZone(userCurrentTimezone) : getBrowserUtcOffset()) * 60;
        return dispatch(searchPostsWithParams(teamId, {terms, is_or_search: isMentionSearch, include_deleted_channels: viewArchivedChannels, time_zone_offset: timezoneOffset, page: 0, per_page: 20}, true));
    };
}

export function showSearchResults(isMentionSearch = false) {
    return (dispatch, getState) => {
        const searchTerms = getSearchTerms(getState());

        if (isMentionSearch) {
            dispatch(updateRhsState(RHSStates.MENTION));
        } else {
            dispatch(updateRhsState(RHSStates.SEARCH));
        }
        dispatch(updateSearchResultsTerms(searchTerms));

        return dispatch(performSearch(searchTerms));
    };
}

export function showRHSPlugin(pluggableId) {
    const action = {
        type: ActionTypes.UPDATE_RHS_STATE,
        state: RHSStates.PLUGIN,
        pluggableId,
    };

    return action;
}

export function hideRHSPlugin(pluggableId) {
    return (dispatch, getState) => {
        if (getPluggableId(getState()) === pluggableId) {
            dispatch(closeRightHandSide());
        }
    };
}

export function toggleRHSPlugin(pluggableId) {
    return (dispatch, getState) => {
        if (getPluggableId(getState()) === pluggableId) {
            dispatch(hideRHSPlugin(pluggableId));
            return;
        }

        dispatch(showRHSPlugin(pluggableId));
    };
}

export function showFlaggedPosts() {
    return async (dispatch, getState) => {
        const state = getState();
        const teamId = getCurrentTeamId(state);

        dispatch({
            type: ActionTypes.UPDATE_RHS_STATE,
            state: RHSStates.FLAG,
        });

        const results = await dispatch(getFlaggedPosts());

        dispatch(batchActions([
            {
                type: SearchTypes.RECEIVED_SEARCH_POSTS,
                data: results.data,
            },
            {
                type: SearchTypes.RECEIVED_SEARCH_TERM,
                data: {
                    teamId,
                    terms: null,
                    isOrSearch: false,
                },
            },
        ]));
    };
}

export function showPinnedPosts(channelId) {
    return async (dispatch, getState) => {
        const state = getState();
        const currentChannelId = getCurrentChannelId(state);
        const teamId = getCurrentTeamId(state);

        dispatch(batchActions([
            {
                type: ActionTypes.UPDATE_RHS_STATE,
                channelId: channelId || currentChannelId,
                state: RHSStates.PIN,
            },
        ]));

        const results = await dispatch(getPinnedPosts(channelId || currentChannelId));

        dispatch(batchActions([
            {
                type: SearchTypes.RECEIVED_SEARCH_POSTS,
                data: results.data,
            },
            {
                type: SearchTypes.RECEIVED_SEARCH_TERM,
                data: {
                    teamId,
                    terms: null,
                    isOrSearch: false,
                },
            },
        ]));
    };
}

export function showMentions() {
    return (dispatch, getState) => {
        const termKeys = getCurrentUserMentionKeys(getState()).filter(({key}) => {
            return key !== '@channel' && key !== '@all' && key !== '@here';
        });

        const terms = termKeys.map(({key}) => key).join(' ').trim() + ' ';

        trackEvent('api', 'api_posts_search_mention');

        dispatch(performSearch(terms, true));
        dispatch(batchActions([
            {
                type: ActionTypes.UPDATE_RHS_SEARCH_TERMS,
                terms,
            },
            {
                type: ActionTypes.UPDATE_RHS_STATE,
                state: RHSStates.MENTION,
            },
        ]));
    };
}

export function closeRightHandSide() {
    return (dispatch) => {
        dispatch(batchActions([
            {
                type: ActionTypes.UPDATE_RHS_STATE,
                state: null,
            },
            {
                type: ActionTypes.SELECT_POST,
                postId: '',
                channelId: '',
                timestamp: 0,
            },
        ]));
    };
}

export const toggleMenu = () => (dispatch) => dispatch({
    type: ActionTypes.TOGGLE_RHS_MENU,
});

export const openMenu = () => (dispatch) => dispatch({
    type: ActionTypes.OPEN_RHS_MENU,
});

export const closeMenu = () => (dispatch) => dispatch({
    type: ActionTypes.CLOSE_RHS_MENU,
});

export function setRhsExpanded(expanded) {
    return {
        type: ActionTypes.SET_RHS_EXPANDED,
        expanded,
    };
}

export function toggleRhsExpanded() {
    return {
        type: ActionTypes.TOGGLE_RHS_EXPANDED,
    };
}

export function selectPost(post) {
    return {
        type: ActionTypes.SELECT_POST,
        postId: post.root_id || post.id,
        channelId: post.channel_id,
        timestamp: Date.now(),
    };
}

export function selectPostCard(post) {
    return {type: ActionTypes.SELECT_POST_CARD, postId: post.id, channelId: post.channel_id};
}

export function openRHSSearch() {
    return (dispatch) => {
        dispatch(clearSearch());
        dispatch(updateSearchTerms(''));
        dispatch(updateSearchResultsTerms(''));

        dispatch(updateRhsState(RHSStates.SEARCH));
    };
}

export function openAtPrevious(previous) {
    return (dispatch, getState) => {
        if (!previous) {
            return openRHSSearch()(dispatch);
        }

        if (previous.isMentionSearch) {
            return showMentions()(dispatch, getState);
        }
        if (previous.isPinnedPosts) {
            return showPinnedPosts()(dispatch, getState);
        }
        if (previous.isFlaggedPosts) {
            return showFlaggedPosts()(dispatch, getState);
        }
        if (previous.selectedPostId) {
            const post = getPost(getState(), previous.selectedPostId);
            return post ? selectPostFromRightHandSideSearchWithPreviousState(post, previous.previousRhsState)(dispatch, getState) : openRHSSearch()(dispatch);
        }
        if (previous.selectedPostCardId) {
            const post = getPost(getState(), previous.selectedPostCardId);
            return post ? selectPostCardFromRightHandSideSearchWithPreviousState(post, previous.previousRhsState)(dispatch, getState) : openRHSSearch()(dispatch);
        }
        if (previous.searchVisible) {
            return showSearchResults()(dispatch, getState);
        }

        return openRHSSearch()(dispatch);
    };
}
