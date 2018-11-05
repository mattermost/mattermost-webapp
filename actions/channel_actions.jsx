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

const doDispatch = store.dispatch;
const doGetState = store.getState;

// To be removed in a future PR
export async function openDirectChannelToUser(userId, success, error) {
    const state = doGetState();
    const currentUserId = getCurrentUserId(state);
    const channelName = Utils.getDirectChannelName(currentUserId, userId);
    const channel = getChannelByName(state, channelName);

    if (channel) {
        trackEvent('api', 'api_channels_join_direct');
        const now = Utils.getTimestamp();

        doDispatch(savePreferences(currentUserId, [
            {user_id: currentUserId, category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: userId, value: 'true'},
            {user_id: currentUserId, category: Preferences.CATEGORY_CHANNEL_OPEN_TIME, name: channel.id, value: now.toString()},
        ]));

        loadProfilesForSidebar();

        if (success) {
            success(channel, true);
        }

        return;
    }

    const result = await ChannelActions.createDirectChannel(currentUserId, userId)(doDispatch, doGetState);
    loadProfilesForSidebar();
    if (result.data && success) {
        success(result.data, false);
    } else if (result.error && error) {
        error({id: result.error.server_error_id, ...result.error});
    }
}

export async function openGroupChannelToUsers(userIds, success, error) {
    const state = doGetState();
    const result = await ChannelActions.createGroupChannel(userIds)(doDispatch, doGetState);
    loadProfilesForSidebar();
    if (result.data && success) {
        success(result.data, false);
    } else if (result.error && error) {
        browserHistory.push(getCurrentTeamUrl(state));
        error({id: result.error.server_error_id, ...result.error});
    }
}

export function loadChannelsForCurrentUser() {
    return async (dispatch, getState) => {
        const state = getState();
        const unreads = getUnreadChannelIds(state);

        await dispatch(ChannelActions.fetchMyChannelsAndMembers(getCurrentTeamId(state)));
        for (const id of unreads) {
            const channel = getChannel(state, id);
            if (channel && channel.type === Constants.DM_CHANNEL) {
                loadNewDMIfNeeded(channel.id);
            } else if (channel && channel.type === Constants.GM_CHANNEL) {
                loadNewGMIfNeeded(channel.id);
            }
        }

        loadProfilesForSidebar();
    };
}

export function searchMoreChannels(term) {
    return async (dispatch, getState) => {
        const state = getState();
        const teamId = getCurrentTeamId(state);

        if (!teamId) {
            throw new Error('No team id');
        }

        const {data, error} = await dispatch(ChannelActions.searchChannels(teamId, term));
        if (data) {
            const myMembers = getMyChannelMemberships(state);
            const channels = data.filter((c) => !myMembers[c.id]);
            return {data: channels};
        }

        return {error};
    };
}

export async function autocompleteChannels(term, success, error) {
    const state = doGetState();
    const teamId = getCurrentTeamId(state);
    if (!teamId) {
        return;
    }

    const {data, error: err} = await ChannelActions.autocompleteChannels(teamId, term)(doDispatch, doGetState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export async function autocompleteChannelsForSearch(term, success, error) {
    const state = doGetState();
    const teamId = getCurrentTeamId(state);
    if (!teamId) {
        return;
    }

    const {data, error: err} = await ChannelActions.autocompleteChannelsForSearch(teamId, term)(doDispatch, doGetState);
    if (data && success) {
        success(data);
    } else if (err && error) {
        error({id: err.server_error_id, ...err});
    }
}

export function addUsersToChannel(channelId, userIds) {
    return async (dispatch) => {
        try {
            const requests = userIds.map((uId) => dispatch(ChannelActions.addChannelMember(channelId, uId)));

            return await Promise.all(requests);
        } catch (error) {
            return {error};
        }
    };
}
