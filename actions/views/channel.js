// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {addChannelMember, selectChannel} from 'mattermost-redux/actions/channels';
import {getChannelByName} from 'mattermost-redux/selectors/entities/channels';

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

export function addUsersToChannel(channelId, userIds) {
    return async (dispatch) => {
        try {
            const requests = userIds.map((uId) => dispatch(addChannelMember(channelId, uId)));

            return await Promise.all(requests);
        } catch (error) {
            return {error};
        }
    };
}
