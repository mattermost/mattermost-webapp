// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {SearchTypes} from 'mattermost-redux/action_types';
import {
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

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {getSearchTerms, getRhsState} from 'selectors/rhs';
import {ActionTypes, RHSStates} from 'utils/constants';
import * as Utils from 'utils/utils';

import {getBrowserUtcOffset, getUtcOffsetForTimeZone} from 'utils/timezone';

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
    return async (dispatch, getState) => {
        const postRootId = Utils.getRootId(post);
        await dispatch(PostActions.getPostThread(postRootId));

        dispatch({
            type: ActionTypes.SELECT_POST,
            postId: postRootId,
            channelId: post.channel_id,
            previousRhsState: getRhsState(getState()),
            timestamp: Date.now(),
        });
    };
}

export function selectPostCardFromRightHandSideSearch(post) {
    return async (dispatch, getState) => {
        dispatch({
            type: ActionTypes.SELECT_POST_CARD,
            postId: post.id,
            channelId: post.channel_id,
            previousRhsState: getRhsState(getState()),
        });
    };
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

export function showSearchResults() {
    return (dispatch, getState) => {
        const searchTerms = getSearchTerms(getState());

        dispatch(updateRhsState(RHSStates.SEARCH));
        dispatch({
            type: ActionTypes.UPDATE_RHS_SEARCH_RESULTS_TERMS,
            terms: searchTerms,
        });

        return dispatch(performSearch(searchTerms));
    };
}

export function showRHSPlugin(pluginId) {
    const action = {
        type: ActionTypes.UPDATE_RHS_STATE,
        state: RHSStates.PLUGIN,
        pluginId,
    };

    return action;
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
                type: ActionTypes.UPDATE_RHS_SEARCH_TERMS,
                terms: '',
            },
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
