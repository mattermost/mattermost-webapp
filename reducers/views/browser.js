// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {ActionTypes} from 'utils/constants.jsx';

function focused(state = true, action) {
    switch (action.type) {
    case ActionTypes.BROWSER_CHANGE_FOCUS:
        return action.focus;
    default:
        return state;
    }
}

export default combineReducers({
    focused,
});
