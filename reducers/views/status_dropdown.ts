// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {UserTypes} from 'mattermost-redux/action_types';
import {GenericAction} from 'mattermost-redux/types/actions';

import {ActionTypes} from 'utils/constants';

export function isOpen(state = false, action: GenericAction) {
    switch (action.type) {
    case ActionTypes.STATUS_DROPDOWN_TOGGLE:
        return action.open;

    case UserTypes.LOGOUT_SUCCESS:
        return false;
    default:
        return state;
    }
}

export default combineReducers({
    isOpen,
});
