// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {UserTypes} from 'mattermost-redux/action_types';

import {ActionTypes} from 'utils/constants.jsx';

function emojiPickerCustomPage(state = 0, action) {
    switch (action.type) {
    case ActionTypes.INCREMENT_EMOJI_PICKER_PAGE:
        return state + 1;
    case UserTypes.LOGOUT_SUCCESS:
        return 0;
    default:
        return state;
    }
}

export default combineReducers({
    emojiPickerCustomPage
});
