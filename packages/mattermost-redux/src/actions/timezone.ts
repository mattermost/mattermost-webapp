// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import timezones from 'timezones.json';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getUserTimezone} from 'mattermost-redux/selectors/entities/timezone';

import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {GeneralTypes} from 'mattermost-redux/action_types';

import {updateMe} from './users';
export function autoUpdateTimezone(deviceTimezone: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const currentUer = getCurrentUser(getState());
        const currentTimezone = getUserTimezone(getState(), currentUer.id);
        const newTimezoneExists = currentTimezone.automaticTimezone !== deviceTimezone;

        if (currentTimezone.useAutomaticTimezone && newTimezoneExists) {
            const timezone = {
                useAutomaticTimezone: 'true',
                automaticTimezone: deviceTimezone,
                manualTimezone: currentTimezone.manualTimezone,
            };

            const updatedUser = {
                ...currentUer,
                timezone,
            };

            updateMe(updatedUser)(dispatch, getState);
        }
    };
}

export function getSupportedTimezones() {
    return async (dispatch: DispatchFunc) => {
        dispatch({type: GeneralTypes.SUPPORTED_TIMEZONES_RECEIVED, data: timezones});
    };
}
