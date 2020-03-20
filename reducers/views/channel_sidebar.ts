// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {UserTypes} from 'mattermost-redux/action_types';

import {ActionTypes} from 'utils/constants';

export function unreadFilterEnabled(state = false, action: GenericAction) {
    switch (action.type) {
    case ActionTypes.SET_UNREAD_FILTER_ENABLED:
        return action.enabled;

    case UserTypes.LOGOUT_SUCCESS:
        return false;
    default:
        return state;
    }
}

export default combineReducers({
    unreadFilterEnabled,
});
