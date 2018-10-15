// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {leaveChannel as leaveChannelRedux, selectChannel, unfavoriteChannel} from 'mattermost-redux/actions/channels';
import {getChannelByName} from 'mattermost-redux/selectors/entities/channels';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {isFavoriteChannel} from 'mattermost-redux/utils/channel_utils';

import {getLastViewedChannelName} from 'selectors/local_storage';

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
        dispatch(selectChannel(lastViewedChannel.id));
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
