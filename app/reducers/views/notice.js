// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {ActionTypes} from 'utils/constants';

function hasBeenDismissed(state = {}, action) {
    switch (action.type) {
    case ActionTypes.DISMISS_NOTICE:
        return {...state, [action.data]: true};
    case ActionTypes.SHOW_NOTICE:
        return {...state, [action.data]: false};
    default:
        return state;
    }
}

export default combineReducers({
    hasBeenDismissed,
});
