// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {SearchTypes} from 'mattermost-redux/action_types';
import {searchPosts} from 'mattermost-redux/actions/search';
import * as PostActions from 'mattermost-redux/actions/posts';
import {Client4} from 'mattermost-redux/client';
import {getCurrentUserId, getCurrentUserMentionKeys} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {getSearchTerms, getRhsState} from 'selectors/rhs';
import {ActionTypes, RHSStates} from 'utils/constants';
import * as Utils from 'utils/utils';

export function updateRhsState(rhsState) {
    return (dispatch, getState) => {
        const action = {
            type: ActionTypes.UPDATE_RHS_STATE,
            state: rhsState,
        };

        if (rhsState === RHSStates.PIN) {
            action.channelId = getCurrentChannelId(getState());
        }

        dispatch(action);
    };
}

export function selectPostFromRightHandSideSearch(post) {
    return async (dispatch, getState) => {
        await dispatch(PostActions.getPostThread(post.id));

        dispatch({
            type: ActionTypes.SELECT_POST,
            postId: Utils.getRootId(post),
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

        return dispatch(searchPosts(teamId, terms, isMentionSearch));
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

function getSearchActions(result, teamId) {
    return [
        {
            type: SearchTypes.RECEIVED_SEARCH_POSTS,
            data: result,
        },
        {
            type: SearchTypes.RECEIVED_SEARCH_TERM,
            data: {
                teamId,
                terms: null,
                isOrSearch: false,
            },
        },
        {
            type: SearchTypes.SEARCH_POSTS_SUCCESS,
        },
    ];
}

function getPreRHSSearchActions(searchPostRequest, terms, rhsState, channelId) {
    const updateRHSState = {
        type: ActionTypes.UPDATE_RHS_STATE,
        state: rhsState,
    };

    if (channelId) {
        updateRHSState.channelId = channelId;
    }

    return [
        {
            type: searchPostRequest,
        },
        {
            type: ActionTypes.UPDATE_RHS_SEARCH_TERMS,
            terms,
        },
        updateRHSState,
    ];
}

function getPostRHSSearchActions(searchPostSuccess, result, teamId) {
    const searchActions = getSearchActions(result, teamId);

    return [...searchActions, {type: searchPostSuccess}];
}

export function getFlaggedPosts() {
    return async (dispatch, getState) => {
        const state = getState();
        const userId = getCurrentUserId(state);
        const teamId = getCurrentTeamId(state);

        const result = await Client4.getFlaggedPosts(userId, '', teamId);

        await PostActions.getProfilesAndStatusesForPosts(result.posts, dispatch, getState);

        const searchActions = getSearchActions(result, teamId);

        dispatch(batchActions(searchActions));
    };
}

export function showFlaggedPosts() {
    return async (dispatch, getState) => {
        const state = getState();
        const userId = getCurrentUserId(state);
        const teamId = getCurrentTeamId(state);

        const preRHSSearchActions = getPreRHSSearchActions(
            ActionTypes.SEARCH_FLAGGED_POSTS_REQUEST,
            '',
            RHSStates.FLAG
        );

        dispatch(batchActions(preRHSSearchActions));

        let result;
        try {
            result = await Client4.getFlaggedPosts(userId, '', teamId);
        } catch (error) {
            dispatch({type: ActionTypes.SEARCH_FLAGGED_POSTS_FAILURE, error});
        }

        await PostActions.getProfilesAndStatusesForPosts(result.posts, dispatch, getState);

        const postRHSSearchActions = getPostRHSSearchActions(
            ActionTypes.SEARCH_FLAGGED_POSTS_SUCCESS,
            result,
            teamId
        );

        dispatch(batchActions(postRHSSearchActions));
    };
}

export function getPinnedPosts(channelId) {
    return async (dispatch, getState) => {
        const currentChannelId = getCurrentChannelId(getState());
        const result = await Client4.getPinnedPosts(channelId || currentChannelId);

        await PostActions.getProfilesAndStatusesForPosts(result.posts, dispatch, getState);

        const teamId = getCurrentTeamId(getState());
        const searchActions = getSearchActions(result, teamId);

        dispatch(batchActions(searchActions));
    };
}

export function showPinnedPosts(channelId) {
    return async (dispatch, getState) => {
        const state = getState();
        const currentChannelId = getCurrentChannelId(state);

        const preRHSSearchActions = getPreRHSSearchActions(
            ActionTypes.SEARCH_PINNED_POSTS_REQUEST,
            '',
            RHSStates.PIN,
            currentChannelId
        );

        dispatch(batchActions(preRHSSearchActions));

        let result;
        try {
            result = await Client4.getPinnedPosts(channelId || currentChannelId);
        } catch (error) {
            dispatch({type: ActionTypes.SEARCH_PINNED_POSTS_FAILURE, error});
        }

        await PostActions.getProfilesAndStatusesForPosts(result.posts, dispatch, getState);

        const teamId = getCurrentTeamId(state);

        const postRHSSearchActions = getPostRHSSearchActions(
            ActionTypes.SEARCH_PINNED_POSTS_SUCCESS,
            result,
            teamId
        );

        dispatch(batchActions(postRHSSearchActions));
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
