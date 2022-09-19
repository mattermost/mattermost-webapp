// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {ActionTypes} from 'utils/constants';

export function setTeamSidebarVisible(state = false, action: GenericAction): boolean {
    switch (action.type) {
    case ActionTypes.SET_TEAM_SIDEBAR_VISIBLE:
        return action.showSidebar;
    default:
        return state;
    }
}

export default combineReducers({
    setTeamSidebarVisible,
});
