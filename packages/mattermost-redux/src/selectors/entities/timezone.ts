// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Timezone} from 'timezones.json';

import {GlobalState} from 'mattermost-redux/types/store';
import {UserProfile} from 'mattermost-redux/types/users';
import {createSelector} from 'reselect';

import {getSupportedTimezones} from './general';

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

export const getTimezoneLabel: (state: GlobalState, timezone: string) => string = createSelector(
    'getTimezoneLabel',
    getSupportedTimezones,
    (state: GlobalState, timezone: string): string => timezone,
    (timezones: Timezone[], timezone: string) => {
        for (let i = 0; i < timezones.length; i++) {
            const zone = timezones[i];
            for (let j = 0; j < zone.utc.length; j++) {
                const utcZone = zone.utc[j];
                if (utcZone.toLowerCase() === timezone.toLowerCase()) {
                    return zone.text;
                }
            }
        }
        return timezone;
    },
);
