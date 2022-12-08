// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {GenericAction} from 'mattermost-redux/types/actions';
import {SidebarTypes, UserTypes} from 'mattermost-redux/action_types';

import {SidebarStaticItem} from '@mattermost/types/sidebar';

function currentStaticItemId(state = '', action: GenericAction) {
    switch (action.type) {
    case SidebarTypes.SELECT_STATIC_ITEM:
        return action.data;
    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

function staticItems(state: SidebarStaticItem[] = [], action: GenericAction) {
    switch (action.type) {
    case UserTypes.LOGOUT_SUCCESS:
        return [];
    default:
        return state;
    }
}

export default combineReducers({
    currentStaticItemId,
    staticItems,
});
