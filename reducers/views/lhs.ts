// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {TeamTypes, UserTypes} from 'mattermost-redux/action_types';
import type {GenericAction} from 'mattermost-redux/types/actions';
import {ActionTypes} from 'utils/constants';
import {LhsStaticItem} from 'types/store/lhs';

function isOpen(state = false, action: GenericAction) {
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

    case UserTypes.LOGOUT_SUCCESS:
        return false;
    default:
        return state;
    }
}

function currentStaticItemId(state = '', action: GenericAction) {
    switch (action.type) {
    case ActionTypes.SELECT_LHS_STATIC_ITEM:
        return action.data;
    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

function staticItems(state: LhsStaticItem[] = [], action: GenericAction) {
    switch (action.type) {
    case ActionTypes.SET_LHS_STATIC_ITEMS:
        return [...action.data];
    case UserTypes.LOGOUT_SUCCESS:
        return [];
    default:
        return state;
    }
}

export default combineReducers({
    isOpen,

    currentStaticItemId,
    staticItems,
});
