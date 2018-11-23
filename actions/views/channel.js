// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {leaveChannel as leaveChannelRedux, unfavoriteChannel} from 'mattermost-redux/actions/channels';
import {getChannel, getChannelByName, getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentRelativeTeamUrl, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getUserByUsername} from 'mattermost-redux/selectors/entities/users';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {isFavoriteChannel} from 'mattermost-redux/utils/channel_utils';
import {autocompleteUsers} from 'mattermost-redux/actions/users';

import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {getLastViewedChannelName} from 'selectors/local_storage';

import {browserHistory} from 'utils/browser_history';
import {ActionTypes} from 'utils/constants.jsx';
import {isMobile} from 'utils/utils.jsx';

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
        const lastViewedChannel = getChannelByName(state, getLastViewedChannelName(state));
        return dispatch(switchToChannel(lastViewedChannel));
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
        } else {
            browserHistory.push(`${teamUrl}/channels/${channel.name}`);
        }

        return {data: true};
    };
}

export function leaveChannel(channelId) {
    return async (dispatch, getState) => {
        const state = getState();
        const myPreferences = getMyPreferences(state);

        if (isFavoriteChannel(myPreferences, channelId)) {
            dispatch(unfavoriteChannel(channelId));
        }

        const {error} = await dispatch(leaveChannelRedux(channelId));
        if (error) {
            return {error};
        }

        return {
            data: true,
        };
    };
}

export function autocompleteUsersInChannel(prefix) {
    return async (dispatch, getState) => {
        const state = getState();
        const currentTeamId = getCurrentTeamId(state);
        const currentChannelId = getCurrentChannelId(state);

        return dispatch(autocompleteUsers(prefix, currentTeamId, currentChannelId));
    };
}

