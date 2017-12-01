// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';

import {ActionTypes, ModalIdentifiers} from 'utils/constants.jsx';

function modalState(state = {}, action) {
    let nextState = {...state};

    switch (action.type) {
        case ActionTypes.MODAL_OPEN:
            nextState[action.modalId] = {
                open: true,
                dialogProps: action.dialogProps,
                dialogType: action.dialogType
            };

            return nextState;
        case ActionTypes.MODAL_CLOSE:
            nextState[action.modalId] = {
                open: false
            };

            return nextState;
        default:
            return state;
    }
}

export default combineReducers({
    modalState
});
