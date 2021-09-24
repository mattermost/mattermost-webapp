// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import timezones, {Timezone} from 'timezones.json';

import {getUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'mattermost-redux/types/store';
import {UserProfile, UserTimezone} from 'mattermost-redux/types/users';
import {createSelector} from 'reselect';

import {$ID} from 'mattermost-redux/types/utilities';
import {getUserCurrentTimezone, getTimezoneLabel as getTimezoneLabelUtil} from 'mattermost-redux/utils/timezone_utils';

export function getUserTimezone(state: GlobalState, id: string) {
    const profile = state.entities.users.profiles[id];
    return getTimezoneForUserProfile(profile);
}

export function getTimezoneForUserProfile(profile: UserProfile) {
    if (profile && profile.timezone) {
        return {
            ...profile.timezone,
            useAutomaticTimezone: profile.timezone.useAutomaticTimezone === 'true',
        };
    }

    return {
        useAutomaticTimezone: true,
        automaticTimezone: '',
        manualTimezone: '',
    };
}

export function isTimezoneEnabled(state: GlobalState) {
    const {config} = state.entities.general;
    return config.ExperimentalTimezone === 'true';
}

export const makeGetUserTimezone: (state: GlobalState, userId: string) => UserTimezone = createSelector(
    'makeGetUserTimezone',
    (state: GlobalState, userId: string) => getUser(state, userId),
    (user: UserProfile) => {
        return getTimezoneForUserProfile(user);
    },
);

export const getTimezoneLabel: (state: GlobalState, userId: $ID<UserProfile>) => string = createSelector(
    'getTimezoneLabel',
    () => timezones,
    makeGetUserTimezone,
    (timezones: Timezone[], timezoneObject: UserTimezone) => {
        const timezone = getUserCurrentTimezone(timezoneObject);
        if (!timezone) {
            return '';
        }
        return getTimezoneLabelUtil(timezones, timezone);
    },
);
