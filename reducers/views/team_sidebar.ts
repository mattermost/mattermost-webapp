// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {ActionTypes} from 'utils/constants';

export function forceTeamSidebarToBeVisible(state = false, action: GenericAction): boolean {
    switch (action.type) {
    case ActionTypes.FORCE_TEAM_SIDEBAR_TO_BE_VISIBLE:
        return action.showSidebar;
    default:
        return state;
    }
}

export default combineReducers({
    forceTeamSidebarToBeVisible,
});
