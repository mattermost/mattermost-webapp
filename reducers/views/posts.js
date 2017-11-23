// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';

import {UserTypes} from 'mattermost-redux/action_types';

import {ActionTypes} from 'utils/constants.jsx';

function editingPost(state = '', action) {
    switch (action.type) {
    case ActionTypes.SET_EDITING_POST:
        return action.data;
    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

export default combineReducers({
    editingPost
});
