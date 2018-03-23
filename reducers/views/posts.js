// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {UserTypes} from 'mattermost-redux/action_types';

import {ActionTypes} from 'utils/constants.jsx';

const defaultState = {
    show: false,
};

function editingPost(state = defaultState, action) {
    switch (action.type) {
    case ActionTypes.SHOW_EDIT_POST_MODAL:
        return {
            ...action.data,
            show: true,
        };
    case ActionTypes.HIDE_EDIT_POST_MODAL:
        return {
            show: false,
        };

    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

export default combineReducers({
    editingPost,
});
