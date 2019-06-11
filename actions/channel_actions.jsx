// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {PreferenceTypes} from 'mattermost-redux/action_types';
import * as ChannelActions from 'mattermost-redux/actions/channels';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getChannelByName, getUnreadChannelIds, getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamUrl, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {loadNewDMIfNeeded, loadNewGMIfNeeded, loadProfilesForSidebar} from 'actions/user_actions.jsx';
import store from 'stores/redux_store.jsx';
import {browserHistory} from 'utils/browser_history';
import {Constants, Preferences} from 'utils/constants.jsx';
import {getDirectChannelName} from 'utils/utils';

const doDispatch = store.dispatch;
const doGetState = store.getState;

export function openDirectChannelToUserId(userId) {
    return async (dispatch, getState) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const channelName = getDirectChannelName(currentUserId, userId);
        const channel = getChannelByName(state, channelName);

        if (!channel) {
            return dispatch(ChannelActions.createDirectChannel(currentUserId, userId));
        }

        trackEvent('api', 'api_channels_join_direct');
        const now = Date.now();
        const prefDirect = {
            category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW,
            name: userId,
            value: 'true',
        };
        const prefOpenTime = {
            category: Preferences.CATEGORY_CHANNEL_OPEN_TIME,
            name: channel.id,
            value: now.toString(),
        };
        const actions = [{
            type: PreferenceTypes.RECEIVED_PREFERENCES,
            data: [prefDirect],
        }, {
            type: PreferenceTypes.RECEIVED_PREFERENCES,
            data: [prefOpenTime],
        }];
        dispatch(batchActions(actions));

        dispatch(savePreferences(currentUserId, [
            {user_id: currentUserId, ...prefDirect},
            {user_id: currentUserId, ...prefOpenTime},
        ]));

        return {data: channel};
    };
}

export function openGroupChannelToUserIds(userIds) {
    return async (dispatch, getState) => {
        const result = await dispatch(ChannelActions.createGroupChannel(userIds));

        if (result.error) {
            browserHistory.push(getCurrentTeamUrl(getState()));
        }

        return result;
    };
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
