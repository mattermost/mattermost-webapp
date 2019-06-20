// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {leaveChannel as leaveChannelRedux, joinChannel, unfavoriteChannel} from 'mattermost-redux/actions/channels';
import * as PostActions from 'mattermost-redux/actions/posts';
import {autocompleteUsers} from 'mattermost-redux/actions/users';
import {Posts} from 'mattermost-redux/constants';
import {getChannel, getChannelsNameMapInCurrentTeam, getCurrentChannel, getRedirectChannelNameForTeam} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentRelativeTeamUrl, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, getUserByUsername} from 'mattermost-redux/selectors/entities/users';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getChannelByName, isFavoriteChannel} from 'mattermost-redux/utils/channel_utils';
import EventEmitter from 'mattermost-redux/utils/event_emitter';

import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {getLastViewedChannelName} from 'selectors/local_storage';
import {getLastPostsApiTimeForChannel} from 'selectors/views/channel';
import {getSocketStatus} from 'selectors/views/websocket';

import {browserHistory} from 'utils/browser_history';
import {Constants, ActionTypes, EventTypes} from 'utils/constants.jsx';
import {isMobile} from 'utils/utils.jsx';
import LocalStorageStore from 'stores/local_storage_store.jsx';

export function checkAndSetMobileView() {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.UPDATE_MOBILE_VIEW,
            data: isMobile(),
        });
    };
}

export function goToLastViewedChannel() {
    return async (dispatch, getState) => {
        const state = getState();
        const currentChannel = getCurrentChannel(state);
        const channelsInTeam = getChannelsNameMapInCurrentTeam(state);

        let channelToSwitchTo = getChannelByName(channelsInTeam, getLastViewedChannelName(state));

        if (currentChannel.id === channelToSwitchTo.id) {
            channelToSwitchTo = getChannelByName(channelsInTeam, getRedirectChannelNameForTeam(state, getCurrentTeamId(state)));
        }

        return dispatch(switchToChannel(channelToSwitchTo));
    };
}

export function switchToChannelById(channelId) {
    return async (dispatch, getState) => {
        const state = getState();
        const channel = getChannel(state, channelId);
        return dispatch(switchToChannel(channel));
    };
}

export function switchToChannel(channel) {
    return async (dispatch, getState) => {
        const state = getState();
        const teamUrl = getCurrentRelativeTeamUrl(state);

        if (channel.fake || channel.userId) {
            const username = channel.userId ? channel.name : channel.display_name;
            const user = getUserByUsername(state, username);
            if (!user) {
                return {error: true};
            }

            const direct = await dispatch(openDirectChannelToUserId(user.id));
            if (direct.error) {
                return {error: true};
            }
            browserHistory.push(`${teamUrl}/messages/@${channel.name}`);
        } else if (channel.type === Constants.GM_CHANNEL) {
            const gmChannel = getChannel(state, channel.id);
            browserHistory.push(`${teamUrl}/channels/${gmChannel.name}`);
        } else {
            browserHistory.push(`${teamUrl}/channels/${channel.name}`);
        }

        return {data: true};
    };
}

export function joinChannelById(channelId) {
    return async (dispatch, getState) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const currentTeamId = getCurrentTeamId(state);

        return dispatch(joinChannel(currentUserId, currentTeamId, channelId));
    };
}

export function leaveChannel(channelId) {
    return async (dispatch, getState) => {
        const state = getState();
        const myPreferences = getMyPreferences(state);
        const currentUserId = getCurrentUserId(state);
        const currentTeamId = getCurrentTeamId(state);

        if (isFavoriteChannel(myPreferences, channelId)) {
            dispatch(unfavoriteChannel(channelId));
        }

        const teamUrl = getCurrentRelativeTeamUrl(state);
        LocalStorageStore.removePreviousChannelName(currentUserId, currentTeamId);
        browserHistory.push(teamUrl);

        const {error} = await dispatch(leaveChannelRedux(channelId));
        if (error) {
            return {error};
        }

        return {
            data: true,
        };
    };
}

export function autocompleteUsersInChannel(prefix, channelId) {
    return async (dispatch, getState) => {
        const state = getState();
        const currentTeamId = getCurrentTeamId(state);

        return dispatch(autocompleteUsers(prefix, currentTeamId, channelId));
    };
}

export function loadInitialPosts(channelId, focusedPostId) {
    return async (dispatch) => {
        let posts;
        let hasMoreBefore = false;
        let hasMoreAfter = false;
        const time = Date.now();
        if (focusedPostId) {
            const result = await dispatch(PostActions.getPostsAround(channelId, focusedPostId, Posts.POST_CHUNK_SIZE / 2));

            posts = result.data;

            if (posts) {
                // If the post is at index i, there are i posts after it and len - i - 1 before it
                const numPostsAfter = posts.order.indexOf(focusedPostId);
                const numPostsBefore = posts.order.length - numPostsAfter - 1;

                hasMoreBefore = numPostsBefore >= Posts.POST_CHUNK_SIZE / 2;
                hasMoreAfter = numPostsAfter >= Posts.POST_CHUNK_SIZE / 2;
            }
        } else {
            const result = await dispatch(PostActions.getPosts(channelId, 0, Posts.POST_CHUNK_SIZE / 2));

            posts = result.data;

            if (posts) {
                hasMoreBefore = posts && posts.order.length >= Posts.POST_CHUNK_SIZE / 2;
            }
        }

        if (posts) {
            dispatch({
                type: ActionTypes.RECEIVED_POSTS_FOR_CHANNEL_AT_TIME,
                channelId,
                time,
            });
        }

        return {
            posts,
            hasMoreBefore,
            hasMoreAfter,
        };
    };
}

export function increasePostVisibility(channelId, beforePostId) {
    return async (dispatch, getState) => {
        const state = getState();
        if (state.views.channel.loadingPosts[channelId]) {
            return true;
        }

        const currentPostVisibility = state.views.channel.postVisibility[channelId];

        if (currentPostVisibility >= Constants.MAX_POST_VISIBILITY) {
            return true;
        }

        dispatch({
            type: ActionTypes.LOADING_POSTS,
            data: true,
            channelId,
        });

        const result = await dispatch(PostActions.getPostsBefore(channelId, beforePostId, 0, Posts.POST_CHUNK_SIZE / 2));
        const posts = result.data;

        const actions = [{
            type: ActionTypes.LOADING_POSTS,
            data: false,
            channelId,
        }];

        if (posts) {
            actions.push({
                type: ActionTypes.INCREASE_POST_VISIBILITY,
                data: channelId,
                amount: posts.order.length,
            });
        }

        dispatch(batchActions(actions));

        return {
            moreToLoad: posts ? posts.order.length >= Posts.POST_CHUNK_SIZE / 2 : false,
            error: result.error,
        };
    };
}

export function syncPostsInChannel(channelId, since) {
    return async (dispatch, getState) => {
        const time = Date.now();
        const state = getState();
        const socketStatus = getSocketStatus(state);
        let sinceTimeToGetPosts = since;
        const lastPostsApiCallForChannel = getLastPostsApiTimeForChannel(state, channelId);

        if (lastPostsApiCallForChannel && lastPostsApiCallForChannel < socketStatus.lastDisconnectAt) {
            sinceTimeToGetPosts = lastPostsApiCallForChannel;
        }

        const {data, error} = await dispatch(PostActions.getPostsSince(channelId, sinceTimeToGetPosts));
        if (data) {
            dispatch({
                type: ActionTypes.RECEIVED_POSTS_FOR_CHANNEL_AT_TIME,
                channelId,
                time,
            });
        }
        return {data, error};
    };
}

export function scrollPostListToBottom() {
    return () => {
        EventEmitter.emit(EventTypes.POST_LIST_SCROLL_CHANGE, true);
    };
}

export function scrollPostList() {
    return () => {
        EventEmitter.emit(EventTypes.POST_LIST_SCROLL_CHANGE, false);
    };
}
