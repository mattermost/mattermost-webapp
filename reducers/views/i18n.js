// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import en from 'i18n/en.json';

import {ActionTypes} from 'utils/constants.jsx';

function translations(state = {en}, action) {
    switch (action.type) {
    case ActionTypes.RECEIVED_TRANSLATIONS:
        return {
            ...state,
            [action.data.locale]: action.data.translations,
        };

    default:
        return state;
    }
}

export default combineReducers({
    translations,
});
