// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import timezones from 'timezones.json';

import {getUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from '@mattermost/types/store';
import {UserProfile} from '@mattermost/types/users';
import {createSelector} from 'reselect';

import {getTimezoneLabel, getUserCurrentTimezone} from 'mattermost-redux/utils/timezone_utils';

import {getCurrentUser} from './common';

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

export const makeGetUserTimezone = () => createSelector(
    'makeGetUserTimezone',
    (state: GlobalState, userId: string) => getUser(state, userId),
    (user: UserProfile) => {
        return getTimezoneForUserProfile(user);
    },
);

export const getCurrentTimezone = createSelector(
    'getCurrentTimezone',
    getCurrentUser,
    (currentUser) => {
        return getUserCurrentTimezone(getTimezoneForUserProfile(currentUser));
    },
);

export const getCurrentTimezoneLabel = createSelector(
    'getCurrentTimezoneLabel',
    getCurrentTimezone,
    (timezone) => {
        if (!timezone) {
            return '';
        }

        return getTimezoneLabel(timezones, timezone);
    },
);
