// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {ActionTypes} from 'utils/constants';

function focused(state = true, action: GenericAction) {
    switch (action.type) {
    case ActionTypes.BROWSER_CHANGE_FOCUS:
        return action.focus;
    default:
        return state;
    }
}

function windowSize(state = {width: null, height: null}, action: GenericAction) {
    switch (action.type) {
    case ActionTypes.BROWSER_WINDOW_RESIZED:
        if (state.width !== action.windowSize.width || state.height !== action.windowSize.height) {
            return action.windowSize;
        }
    }
    return state;
}

export default combineReducers({
    focused,
    windowSize,
});
