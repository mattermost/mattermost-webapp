// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';

import {ActionTypes} from 'utils/constants.jsx';

function modalState(state = {}, action) {
    switch (action.type) {
    case ActionTypes.MODAL_OPEN:
        return {
            ...state,
            [action.modalId]: {
                open: true,
                dialogProps: action.dialogProps,
                dialogType: action.dialogType
            }
        };
    case ActionTypes.MODAL_CLOSE:
        return {
            ...state,
            [action.modalId]: {
                open: false,
                dialogProps: action.dialogProps,
                dialogType: action.dialogType
            }
        };

    default:
        return state;
    }
}

export default combineReducers({
    modalState
});
