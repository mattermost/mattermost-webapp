// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {ViewsState} from 'types/store/views';

import {ActionTypes} from 'utils/constants';

export function modalState(state: ViewsState['modals']['modalState'] = {}, action: GenericAction) {
    switch (action.type) {
    case ActionTypes.MODAL_OPEN:
        return {
            ...state,
            [action.modalId]: {
                open: true,
                dialogProps: action.dialogProps,
                dialogType: action.dialogType,
            },
        };
    case ActionTypes.MODAL_CLOSE: {
        const newState = Object.assign({}, state);
        Reflect.deleteProperty(newState, action.modalId);
        return newState;
    }
    default:
        return state;
    }
}

export default combineReducers({
    modalState,
});
