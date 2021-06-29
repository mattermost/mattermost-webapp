// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {TeamTypes, ChannelTypes} from 'mattermost-redux/action_types';

import {ActionTypes} from 'utils/constants';

function isOpen(state = false, action) {
    switch (action.type) {
    case ActionTypes.TOGGLE_LHS:
        return !state;
    case ActionTypes.OPEN_LHS:
        return true;
    case ActionTypes.CLOSE_LHS:
        return false;
    case ActionTypes.TOGGLE_RHS_MENU:
        return false;
    case ActionTypes.OPEN_RHS_MENU:
        return false;
    case TeamTypes.SELECT_TEAM:
        return false;
    default:
        return state;
    }
}

function selectedItem(state = '', action) {
    switch (action.type) {
    case ActionTypes.SELECT_LHS_NAV_ITEM:
        return action.item;
    case ChannelTypes.SELECT_CHANNEL:
        // we handle empty ids separetely
        if (action.data === '') {
            return state;
        }
        return action.data;
    default:
        return state;
    }
}

export default combineReducers({
    isOpen,
    selectedItem,
});
