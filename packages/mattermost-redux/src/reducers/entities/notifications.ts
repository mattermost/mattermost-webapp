// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {NotificationTypes, UserTypes} from 'mattermost-redux/action_types';
import {GenericAction} from 'mattermost-redux/types/actions';
import {App, NotificationCount, Notification} from 'mattermost-redux/types/notifications';

function providers(state: App[] = [], action: GenericAction) {
    switch (action.type) {
    case NotificationTypes.RECEIVED_APPS:
        return action.data;

        /*case NotificationTypes.RECEIVED_APP: {
        const nextState = {...state};
        const data = action.data;

        if (data) {
            nextState[data.name] = data;
            return nextState;
        }

        return state;
    }*/

    case UserTypes.LOGOUT_SUCCESS:
        return [];
    default:
        return state;
    }
}

function counts(state: NotificationCount[] = [], action: GenericAction) {
    switch (action.type) {
    case NotificationTypes.RECEIVED_COUNTS:
        return action.data;

    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function items(state: Notification[] = [], action: GenericAction) {
    switch (action.type) {
    case NotificationTypes.RECEIVED_NOTIFICATIONS:
        return action.data;

    case NotificationTypes.RECEIVED_NOTIFICATION:
        const nextState = [...state];
        const data = action.data;

        if (data) {
            nextState.push(data);
            return nextState;
        }

        return state;

    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export default combineReducers({

    // object where the key is the app name and has the corresponding value
    providers,

    // object where the key is the provider-type and the value is another object with key as notification type and value as the count
    counts,

    items,
});
