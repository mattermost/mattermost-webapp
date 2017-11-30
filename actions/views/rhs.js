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

import {trackEvent} from 'actions/diagnostics_actions.jsx';

import {getSearchTerms, getRhsState} from 'selectors/rhs';

import {ActionTypes, RHSStates} from 'utils/constants';
import * as Utils from 'utils/utils';

export function updateRhsState(rhsState) {
    return (dispatch, getState) => {
        const action = {
            type: ActionTypes.UPDATE_RHS_STATE,
            state: rhsState
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
            previousRhsState: getRhsState(getState())
        });
    };
}

export function updateSearchTerms(terms) {
    return {
        type: ActionTypes.UPDATE_RHS_SEARCH_TERMS,
        terms
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

        return dispatch(performSearch(searchTerms));
    };
}

function receivedSearchPosts(teamId, result) {
    return batchActions([
        {
            type: SearchTypes.RECEIVED_SEARCH_POSTS,
            data: result
        },
        {
            type: SearchTypes.RECEIVED_SEARCH_TERM,
            data: {
                teamId,
                terms: null,
                isOrSearch: false
            }
        },
        {
            type: SearchTypes.SEARCH_POSTS_SUCCESS
        }
    ], 'SEARCH_POST_BATCH');
}

export function getFlaggedPosts() {
    return async (dispatch, getState) => {
        const state = getState();
        const userId = getCurrentUserId(state);
        const teamId = getCurrentTeamId(state);

        const result = await Client4.getFlaggedPosts(userId, '', teamId);

        await PostActions.getProfilesAndStatusesForPosts(result.posts, dispatch, getState);

        dispatch(receivedSearchPosts(teamId, result));
    };
}

export function showFlaggedPosts() {
    return (dispatch) => {
        dispatch(getFlaggedPosts());
        dispatch(updateSearchTerms(''));
        dispatch(updateRhsState(RHSStates.FLAG));
    };
}

export function getPinnedPosts(channelId) {
    return async (dispatch, getState) => {
        const currentChannelId = getCurrentChannelId(getState());

        const result = await Client4.getPinnedPosts(channelId || currentChannelId);

        await PostActions.getProfilesAndStatusesForPosts(result.posts, dispatch, getState);

        const teamId = getCurrentTeamId(getState());

        dispatch(receivedSearchPosts(teamId, result));
    };
}

export function showPinnedPosts(channelId) {
    return (dispatch) => {
        dispatch(getPinnedPosts(channelId));
        dispatch(updateSearchTerms(''));
        dispatch(updateRhsState(RHSStates.PIN));
    };
}

export function showMentions() {
    return (dispatch, getState) => {
        const termKeys = [...getCurrentUserMentionKeys(getState())];

        const indexOfChannel = termKeys.indexOf('@channel');
        if (indexOfChannel !== -1) {
            termKeys.splice(indexOfChannel, 1);
        }

        const indexOfAll = termKeys.indexOf('@all');
        if (indexOfAll !== -1) {
            termKeys.splice(indexOfAll, 1);
        }

        const indexOfHere = termKeys.indexOf('@here');
        if (indexOfHere !== -1) {
            termKeys.splice(indexOfHere, 1);
        }

        const terms = termKeys.join(' ').trim() + ' ';

        trackEvent('api', 'api_posts_search_mention');

        dispatch(updateSearchTerms(terms));
        dispatch(performSearch(terms, true));
        dispatch(updateRhsState(RHSStates.MENTION));
    };
}

export function closeRightHandSide() {
    return (dispatch) => {
        dispatch(updateRhsState(null));
        dispatch({
            type: ActionTypes.SELECT_POST,
            postId: '',
            channelId: ''
        });
    };
}