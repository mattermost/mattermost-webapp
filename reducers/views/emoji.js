// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {UserTypes} from 'mattermost-redux/action_types';

import {ActionTypes, Locations} from 'utils/constants';

const INITIAL_STATE_EMOJI_FOR_LAST_MESSAGE = {
    shouldOpen: false,
    emittedFrom: ''
};

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

function emojiPickerForLastMessage(state = INITIAL_STATE_EMOJI_FOR_LAST_MESSAGE, action) {
    switch (action.type) {
    case ActionTypes.SHOW_LAST_MESSAGES_EMOJI_LIST:
        if (action.payload.emittedFrom === Locations.CENTER) {
            return {
                shouldOpen: true,
                emittedFrom: Locations.CENTER
            };
        } else if (action.payload.emittedFrom === Locations.RHS_ROOT) {
            return {
                shouldOpen: true,
                emittedFrom: Locations.RHS_ROOT
            };
        }
        return state;
    case ActionTypes.HIDE_LAST_MESSAGES_EMOJI_LIST:
        return {
            shouldOpen: false,
            emittedFrom: ''
        };
    default:
        return state;
    }
}

export default combineReducers({
    emojiPickerCustomPage,
    emojiPickerForLastMessage
});
