// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {UserTypes} from 'mattermost-redux/action_types';

import {ActionTypes} from 'utils/constants';

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

function menuActions(state = {}, action) {
    switch (action.type) {
    case ActionTypes.SELECT_ATTACHMENT_MENU_ACTION: {
        const nextState = {...state};
        if (nextState[action.postId]) {
            nextState[action.postId] = {
                ...nextState[action.postId],
                ...action.data,
            };
        } else {
            nextState[action.postId] = action.data;
        }
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export default combineReducers({
    editingPost,
    menuActions,
});
