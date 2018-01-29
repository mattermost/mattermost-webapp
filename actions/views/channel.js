// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {isMobile} from 'utils/utils.jsx';
import {ActionTypes} from 'utils/constants.jsx';

export function checkAndSetMobileView() {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.UPDATE_MOBILE_VIEW,
            data: isMobile()
        });
    };
}

export function keepChanneIdAsUnread(channelId) {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.KEEP_CHANNEL_AS_UNREAD,
            data: channelId
        });
    };
}
