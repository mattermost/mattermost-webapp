// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';

import {SearchTypes} from 'utils/constants';

function addUsersToTeam(state = '', action) {
    switch (action.type) {
    case SearchTypes.SET_ADD_USERS_TO_TEAM_SEARCH: {
        return action.data;
    }
    default:
        return state;
    }
}

export default combineReducers({
    addUsersToTeam,
});
