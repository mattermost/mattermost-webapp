// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {NotificationTypes, UserTypes} from 'mattermost-redux/action_types';
import {GenericAction} from 'mattermost-redux/types/actions';
import {App, NotificationCount} from 'mattermost-redux/types/notifications';
import {Dictionary} from 'mattermost-redux/types/utilities';

function apps(state: Dictionary<App> = {}, action: GenericAction) {
    switch (action.type) {
    case NotificationTypes.RECEIVED_APPS:
        return action.data;


    case NotificationTypes.RECEIVED_APP: {
        const nextState = {...state};
        const data = action.data;

        if (data) {
            nextState[data.name] = data;
        }

        return nextState;
    }

    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function counts(state: Dictionary<Dictionary<NotificationCount>> = {}, action: GenericAction) {
    switch (action.type) {
    case NotificationTypes.RECEIVED_COUNTS:
        return action.data;

    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export default combineReducers({

    // object where the key is the app name and has the corresponding value
    apps,

    // object where the key is the provider-type and the value is another object with key as notification type and value as the count
    counts,
});
