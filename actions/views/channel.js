// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

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

export function setCenterChannelDropdown(open = false) {
    return (dispatch) => {
        dispatch({
            type: ActionTypes.TOGGLE_CENTER_CHANNEL_DROPDOWN,
            data: open,
        });
    };
}
