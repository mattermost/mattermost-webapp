// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getStatusesByIds} from 'mattermost-redux/actions/users';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getPostsInCurrentChannel} from 'mattermost-redux/selectors/entities/posts';
import {getDirectShowPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import store from 'stores/redux_store.jsx';
import {Constants} from 'utils/constants';

export function loadStatusesForChannelAndSidebar() {
    return (dispatch, getState) => {
        const state = getState();
        const statusesToLoad = {};

        const channelId = getCurrentChannelId(state);
        const postsInChannel = getPostsInCurrentChannel(state);

        if (postsInChannel) {
            const posts = postsInChannel.slice(0, state.views.channel.postVisibility[channelId] || 0);
            for (const post of posts) {
                if (post.user_id) {
                    statusesToLoad[post.user_id] = true;
                }
            }
        }

        const dmPrefs = getDirectShowPreferences(state);

        for (const pref of dmPrefs) {
            if (pref.value === 'true') {
                statusesToLoad[pref.name] = true;
            }
        }

        const currentUserId = getCurrentUserId(state);
        statusesToLoad[currentUserId] = true;

        dispatch(loadStatusesByIds(Object.keys(statusesToLoad)));
    };
}

export function loadStatusesForProfilesList(users) {
    return (dispatch) => {
        if (users == null) {
            return {data: false};
        }

        const statusesToLoad = [];
        for (let i = 0; i < users.length; i++) {
            statusesToLoad.push(users[i].id);
        }

        dispatch(loadStatusesByIds(statusesToLoad));

        return {data: true};
    };
}

export function loadStatusesForProfilesMap(users) {
    return (dispatch) => {
        if (users == null) {
            return;
        }

        const statusesToLoad = [];
        for (const userId in users) {
            if ({}.hasOwnProperty.call(users, userId)) {
                statusesToLoad.push(userId);
            }
        }

        dispatch(loadStatusesByIds(statusesToLoad));
    };
}

export function loadStatusesByIds(userIds) {
    return (dispatch) => {
        if (userIds.length === 0) {
            return;
        }

        dispatch(getStatusesByIds(userIds));
    };
}

let intervalId = '';

export function startPeriodicStatusUpdates() {
    clearInterval(intervalId);

    intervalId = setInterval(
        () => {
            store.dispatch(loadStatusesForChannelAndSidebar());
        },
        Constants.STATUS_INTERVAL,
    );
}

export function stopPeriodicStatusUpdates() {
    clearInterval(intervalId);
}
