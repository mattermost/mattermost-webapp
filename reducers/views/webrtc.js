// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {TeamTypes} from 'mattermost-redux/action_types';

import {ActionTypes} from 'utils/constants.jsx';

function isOpen(state = false, action) {
    switch (action.type) {
    case ActionTypes.INIT_WEBRTC:
        return Boolean(action.userId);
    case ActionTypes.CLOSE_WEBRTC:
        return false;
    case ActionTypes.CLOSE_RHS:
        return false;
    case ActionTypes.TOGGLE_LHS:
        return false;
    case ActionTypes.OPEN_LHS:
        return false;
    case TeamTypes.SELECT_TEAM:
        return false;
    default:
        return state;
    }
}

function isBusy(state = false, action) {
    switch (action.type) {
    case ActionTypes.UPDATE_BUSY_WEBRTC:
        return Boolean(action.userId);
    default:
        return state;
    }
}

export default combineReducers({
    isOpen,
    isBusy,
});
