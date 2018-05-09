// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {isMobile} from 'utils/utils.jsx';
import {ActionTypes} from 'utils/constants.jsx';

export function checkAndSetMobileView() {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.UPDATE_MOBILE_VIEW,
            data: isMobile(),
        });
    };
}

export function addHiddenDefaultChannel(teamId, channelId) {
    return (dispatch) => {
        if (teamId && channelId) {
            dispatch({
                type: ActionTypes.ADD_HIDDEN_DEFAULT_CHANNEL,
                data: {teamId, channelId},
            });
        }
    };
}

export function removeHiddenDefaultChannel(teamId, channelId) {
    return (dispatch) => {
        if (teamId && channelId) {
            dispatch({
                type: ActionTypes.REMOVE_HIDDEN_DEFAULT_CHANNEL,
                data: {teamId, channelId},
            });
        }
    };
}
