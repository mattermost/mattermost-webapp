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

export function keepChannelIdAsUnread(channelId, hadMentions) {
    return {
        type: ActionTypes.KEEP_CHANNEL_AS_UNREAD,
        data: {
            id: channelId,
            hadMentions
        }
    };
}

export function clearKeepChannelIdAsUnread() {
    return {
        type: ActionTypes.CLEAR_KEEP_CHANNEL_AS_UNREAD
    };
}
