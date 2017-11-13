import {batchActions} from 'redux-batched-actions';

import {SearchTypes} from 'mattermost-redux/action_types';
import {searchPosts} from 'mattermost-redux/actions/search';
import * as PostActions from 'mattermost-redux/actions/posts';

import {Client4} from 'mattermost-redux/client';

import {getCurrentUser, getCurrentUserId, getCurrentUserMentionKeys} from 'mattermost-redux/selectors/entities/users';
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

        const state = getState();

        const rhsState = getRhsState(state);

        dispatch({
            type: ActionTypes.SELECT_POST,
            postId: Utils.getRootId(post),
            channelId: post.channel_id,
            from_search: rhsState === RHSStates.SEARCH,
            from_flagged_posts: rhsState === RHSStates.FLAG,
            from_pinned_posts: rhsState === RHSStates.PIN
        });
    };
}

export function updateSearchTerms(terms) {
    return {
        type: ActionTypes.UPDATE_RHS_SEARCH_TERMS,
        terms
    };
}

export function performSearch(terms) {
    return (dispatch, getState) => {
        const teamId = getCurrentTeamId(getState());

        return dispatch(searchPosts(teamId, terms));
    };
}

export function showSearchResult() {
    return async (dispatch, getState) => {
        const searchTerms = getSearchTerms(getState());

        const result = await dispatch(performSearch(searchTerms));

        dispatch(updateRhsState(RHSStates.SEARCH));

        return result;
    };
}

export function showFlaggedPosts() {
    return async (dispatch, getState) => {
        const state = getState();
        const userId = getCurrentUserId(state);
        const teamId = getCurrentTeamId(state);

        const result = await Client4.getFlaggedPosts(userId, '', teamId);

        await PostActions.getProfilesAndStatusesForPosts(result.posts, dispatch, getState);

        dispatch(batchActions([
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
        ]), getState);

        dispatch(updateSearchTerms(''));
        dispatch(updateRhsState(RHSStates.FLAG));
    };
}

export function showPinnedPosts(channelId) {
    return async (dispatch, getState) => {
        const currentChannelId = getCurrentChannelId(getState());

        const result = await Client4.getPinnedPosts(channelId || currentChannelId);

        await PostActions.getProfilesAndStatusesForPosts(result.posts, dispatch, getState);

        const teamId = getCurrentTeamId(getState());

        dispatch(batchActions([
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
        ]), getState);

        dispatch(updateSearchTerms(''));
        dispatch(updateRhsState(RHSStates.PIN));
    };
}

export function showMentions() {
    return (dispatch, getState) => {
        let terms = '';
        const state = getState();
        const user = getCurrentUser(state);

        if (user.notify_props) {
            const termKeys = getCurrentUserMentionKeys(state);

            if (termKeys.indexOf('@channel') !== -1) {
                termKeys[termKeys.indexOf('@channel')] = '';
            }

            if (termKeys.indexOf('@all') !== -1) {
                termKeys[termKeys.indexOf('@all')] = '';
            }

            terms = termKeys.join(' ');
        }

        trackEvent('api', 'api_posts_search_mention');

        dispatch(updateSearchTerms(terms));
        dispatch(performSearch(terms));
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