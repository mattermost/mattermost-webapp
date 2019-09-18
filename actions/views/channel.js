// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {leaveChannel as leaveChannelRedux, joinChannel, unfavoriteChannel} from 'mattermost-redux/actions/channels';
import * as PostActions from 'mattermost-redux/actions/posts';
import {TeamTypes} from 'mattermost-redux/action_types';
import {autocompleteUsers} from 'mattermost-redux/actions/users';
import {selectTeam} from 'mattermost-redux/actions/teams';
import {Posts} from 'mattermost-redux/constants';
import {getChannel, getChannelsNameMapInCurrentTeam, getCurrentChannel, getRedirectChannelNameForTeam, getMyChannels, getMyChannelMemberships} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentRelativeTeamUrl, getCurrentTeam, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, getUserByUsername} from 'mattermost-redux/selectors/entities/users';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getChannelByName, isFavoriteChannel} from 'mattermost-redux/utils/channel_utils';
import EventEmitter from 'mattermost-redux/utils/event_emitter';

import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {getLastViewedChannelName} from 'selectors/local_storage';
import {getLastPostsApiTimeForChannel} from 'selectors/views/channel';
import {getSocketStatus} from 'selectors/views/websocket';

import {browserHistory} from 'utils/browser_history';
import {Constants, ActionTypes, EventTypes, PostRequestTypes} from 'utils/constants.jsx';
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
        const currentTeam = getCurrentTeam(state);

        if (isFavoriteChannel(myPreferences, channelId)) {
            dispatch(unfavoriteChannel(channelId));
        }

        const teamUrl = getCurrentRelativeTeamUrl(state);
        LocalStorageStore.removePreviousChannelName(currentUserId, currentTeam.id);
        const {error} = await dispatch(leaveChannelRedux(channelId));
        if (error) {
            return {error};
        }
        const prevChannelName = LocalStorageStore.getPreviousChannelName(currentUserId, currentTeam.id);
        const channelsInTeam = getChannelsNameMapInCurrentTeam(state);
        const prevChannel = getChannelByName(channelsInTeam, prevChannelName);
        if (!prevChannel || !getMyChannelMemberships(getState())[prevChannel.id]) {
            LocalStorageStore.removePreviousChannelName(currentUserId, currentTeam.id);
        }
        if (getMyChannels(getState()).filter((c) => c.type === Constants.OPEN_CHANNEL || c.type === Constants.PRIVATE_CHANNEL).length === 0) {
            LocalStorageStore.removePreviousChannelName(currentUserId, currentTeam.id);
            dispatch(selectTeam(''));
            dispatch({type: TeamTypes.LEAVE_TEAM, data: currentTeam});
            browserHistory.push('/');
        } else {
            browserHistory.push(teamUrl);
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

export function loadUnreads(channelId) {
    return async (dispatch) => {
        const time = Date.now();
        const {data, error} = await dispatch(PostActions.getPostsUnread(channelId));
        if (error) {
            return {
                error,
                atLatestMessage: false,
                atOldestmessage: false,
            };
        }

        dispatch({
            type: ActionTypes.INCREASE_POST_VISIBILITY,
            data: channelId,
            amount: data.order.length,
        });

        if (data.next_post_id === '') {
            dispatch({
                type: ActionTypes.RECEIVED_POSTS_FOR_CHANNEL_AT_TIME,
                channelId,
                time,
            });
        }

        return {
            atLatestMessage: data.next_post_id === '',
            atOldestmessage: data.prev_post_id === '',
        };
    };
}

export function loadPostsAround(channelId, focusedPostId) {
    return async (dispatch) => {
        const {data, error} = await dispatch(PostActions.getPostsAround(channelId, focusedPostId, Posts.POST_CHUNK_SIZE / 2));
        if (error) {
            return {
                error,
                atLatestMessage: false,
                atOldestmessage: false,
            };
        }

        dispatch({
            type: ActionTypes.INCREASE_POST_VISIBILITY,
            data: channelId,
            amount: data.order.length,
        });
        return {
            atLatestMessage: data.next_post_id === '',
            atOldestmessage: data.prev_post_id === '',
        };
    };
}

export function loadLatestPosts(channelId) {
    return async (dispatch) => {
        const time = Date.now();
        const {data, error} = await dispatch(PostActions.getPosts(channelId, 0, Posts.POST_CHUNK_SIZE / 2));

        if (error) {
            return {
                error,
                atLatestMessage: false,
                atOldestmessage: false,
            };
        }

        dispatch({
            type: ActionTypes.RECEIVED_POSTS_FOR_CHANNEL_AT_TIME,
            channelId,
            time,
        });

        return {
            data,
            atLatestMessage: data.next_post_id === '',
            atOldestmessage: data.prev_post_id === '',
        };
    };
}

export function loadPosts({channelId, postId, type}) {
    //type here can be BEFORE_ID or AFTER_ID
    return async (dispatch) => {
        const POST_INCREASE_AMOUNT = Constants.POST_CHUNK_SIZE / 2;

        dispatch({
            type: ActionTypes.LOADING_POSTS,
            data: true,
            channelId,
        });

        const page = 0;
        let result;
        if (type === PostRequestTypes.BEFORE_ID) {
            result = await dispatch(PostActions.getPostsBefore(channelId, postId, page, POST_INCREASE_AMOUNT));
        } else {
            result = await dispatch(PostActions.getPostsAfter(channelId, postId, page, POST_INCREASE_AMOUNT));
        }

        const {data} = result;

        const actions = [{
            type: ActionTypes.LOADING_POSTS,
            data: false,
            channelId,
        }];

        if (result.error) {
            return {
                error: result.error,
                moreToLoad: true,
            };
        }
        actions.push({
            type: ActionTypes.INCREASE_POST_VISIBILITY,
            data: channelId,
            amount: data.order.length,
        });

        dispatch(batchActions(actions));

        return {
            moreToLoad: type === PostRequestTypes.BEFORE_ID ? data.prev_post_id !== '' : data.next_post_id !== '',
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
