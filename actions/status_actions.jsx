// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getStatusesByIds} from 'mattermost-redux/actions/users';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getPostsInCurrentChannel} from 'mattermost-redux/selectors/entities/posts';
import {getDirectShowPreferences} from 'mattermost-redux/selectors/entities/preferences';

import store from 'stores/redux_store.jsx';
import {Constants} from 'utils/constants.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

export function loadStatusesForDMSidebar() {
    const dmPrefs = getDirectShowPreferences(getState());
    const statusesToLoad = [];

    for (const pref in dmPrefs) {
        if (pref.value === 'true') {
            statusesToLoad[pref.key] = true;
        }
    }

    loadStatusesByIds(statusesToLoad);
}

export function loadStatusesForChannelAndSidebar() {
    const statusesToLoad = {};

    const channelId = getCurrentChannelId(getState());
    const postsInChannel = getPostsInCurrentChannel(getState());
    const posts = postsInChannel.slice(0, getState().views.channel.postVisibility[channelId]);
    for (const post of posts) {
        if (post.user_id) {
            statusesToLoad[post.user_id] = true;
        }
    }

    const dmPrefs = getDirectShowPreferences(getState());

    for (const pref in dmPrefs) {
        if (pref.value === 'true') {
            statusesToLoad[pref.key] = true;
        }
    }

    const {currentUserId} = getState().entities.users;
    statusesToLoad[currentUserId] = true;

    loadStatusesByIds(Object.keys(statusesToLoad));
}

export function loadStatusesForProfilesList(users) {
    if (users == null) {
        return;
    }

    const statusesToLoad = [];
    for (let i = 0; i < users.length; i++) {
        statusesToLoad.push(users[i].id);
    }

    loadStatusesByIds(statusesToLoad);
}

export function loadStatusesForProfilesMap(users) {
    if (users == null) {
        return;
    }

    const statusesToLoad = [];
    for (const userId in users) {
        if ({}.hasOwnProperty.call(users, userId)) {
            statusesToLoad.push(userId);
        }
    }

    loadStatusesByIds(statusesToLoad);
}

export function loadStatusesByIds(userIds) {
    if (userIds.length === 0) {
        return;
    }

    getStatusesByIds(userIds)(dispatch, getState);
}

let intervalId = '';

export function startPeriodicStatusUpdates() {
    clearInterval(intervalId);

    intervalId = setInterval(
        () => {
            loadStatusesForChannelAndSidebar();
        },
        Constants.STATUS_INTERVAL
    );
}

export function stopPeriodicStatusUpdates() {
    clearInterval(intervalId);
}
