// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getUsers} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'mattermost-redux/types/store';
import {IDMappedObjects} from 'mattermost-redux/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';

export function getUserTimezone(users: IDMappedObjects<UserProfile>, id: string): { useAutomaticTimezone: boolean; automaticTimezone: string; manualTimezone: string } {
    const profile = users[id];

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

export function makeGetUserTimezone() {
    return createSelector(
        getUsers,
        (state: GlobalState, id: string) => id,
        (users, id) => {
            return getUserTimezone(users, id);
        },
    );
}

export function isTimezoneEnabled(state: GlobalState) {
    const {config} = state.entities.general;
    return config.ExperimentalTimezone === 'true';
}
