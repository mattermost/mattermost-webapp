// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as ChannelActions from 'mattermost-redux/actions/channels';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getChannelByName, getUnreadChannelIds, getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamUrl, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {browserHistory} from 'utils/browser_history';
import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {loadNewDMIfNeeded, loadNewGMIfNeeded, loadProfilesForSidebar} from 'actions/user_actions.jsx';
import store from 'stores/redux_store.jsx';
import {Constants, Preferences} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

// To be removed in a future PR
export async function openDirectChannelToUser(userId, success, error) {
    const state = getState();
    const currentUserId = getCurrentUserId(state);
    const channelName = Utils.getDirectChannelName(currentUserId, userId);
    const channel = getChannelByName(state, channelName);

    if (channel) {
        trackEvent('api', 'api_channels_join_direct');
        const now = Utils.getTimestamp();

        dispatch(savePreferences(currentUserId, [
            {user_id: currentUserId, category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: userId, value: 'true'},
            {user_id: currentUserId, category: Preferences.CATEGORY_CHANNEL_OPEN_TIME, name: channel.id, value: now.toString()},
        ]));

        loadProfilesForSidebar();

        if (success) {
            success(channel, true);
        }

        return;
    }

    const result = await ChannelActions.createDirectChannel(currentUserId, userId)(dispatch, getState);
    loadProfilesForSidebar();
    if (result.data && success) {
        success(result.data, false);
    } else if (result.error && error) {
        error({id: result.error.server_error_id, ...result.error});
    }
}

export async function openGroupChannelToUsers(userIds, success, error) {
    const state = getState();
    const result = await ChannelActions.createGroupChannel(userIds)(dispatch, getState);
    loadProfilesForSidebar();
    if (result.data && success) {
        success(result.data, false);
    } else if (result.error && error) {
        browserHistory.push(getCurrentTeamUrl(state));
        error({id: result.error.server_error_id, ...result.error});
    }
}

export async function loadChannelsForCurrentUser() {
    const state = getState();
    await ChannelActions.fetchMyChannelsAndMembers(getCurrentTeamId(state))(dispatch, getState);
    loadDMsAndGMsForUnreads();
    loadProfilesForSidebar();
}

export function loadDMsAndGMsForUnreads() {
    const state = getState();
    const unreads = getUnreadChannelIds(state);
    for (const id of unreads) {
        const channel = getChannel(state, id);
        if (channel && channel.type === Constants.DM_CHANNEL) {
            loadNewDMIfNeeded(channel.id);
        } else if (channel && channel.type === Constants.GM_CHANNEL) {
            loadNewGMIfNeeded(channel.id);
        }
    }
}

export async function searchMoreChannels(term, success, error) {
    const state = getState();
    const teamId = getCurrentTeamId(state);
    if (!teamId) {
        return;
    }

    const {data, error: err} = await ChannelActions.searchChannels(teamId, term)(dispatch, getState);
    if (data && success) {
        const myMembers = getMyChannelMemberships(getState());
        const channels = data.filter((c) => !myMembers[c.id]);
        success(channels);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function autocompleteChannels(term, success, error) {
    const state = getState();
    const teamId = getCurrentTeamId(state);
    if (!teamId) {
        return;
    }

    const {data, error: err} = await ChannelActions.autocompleteChannels(teamId, term)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function autocompleteChannelsForSearch(term, success, error) {
    const state = getState();
    const teamId = getCurrentTeamId(state);
    if (!teamId) {
        return;
    }

    const {data, error: err} = await ChannelActions.autocompleteChannelsForSearch(teamId, term)(dispatch, getState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function addUsersToChannel(channelId, userIds) {
    return async (doDispatch) => {
        try {
            const requests = userIds.map((uId) => doDispatch(ChannelActions.addChannelMember(channelId, uId)));

            return await Promise.all(requests);
        } catch (error) {
            return {error};
        }
    };
}
