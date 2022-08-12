// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector, useDispatch} from 'react-redux';

import {GlobalState} from '@mattermost/types/store';
import {ClientConfig, ClientLicense} from '@mattermost/types/config';
import {PreferenceType} from '@mattermost/types/preferences';
import {UserProfile} from '@mattermost/types/users';

import {getUser as fetchUser} from 'mattermost-redux/actions/entities/users';

import {useEffect} from 'react';

import {getPreferenceKey} from '../utils/preferences';
import Preferences from '../constants/preferences';

function getConfig(state: GlobalState): Partial<ClientConfig> {
    return state.entities.general.config;
}

function getLicense(state: GlobalState): ClientLicense {
    return state.entities.general.license;
}

function getMyPreferences(state: GlobalState): { [x: string]: PreferenceType } {
    return state.entities.preferences.myPreferences;
}

function getUser(state: GlobalState, id: UserProfile['id']): UserProfile {
    return state.entities.users.profiles[id];
}

export function useTeammateNameDisplaySetting() {
    const config = useSelector(getConfig);
    const license = useSelector(getLicense);
    const preferences = useSelector(getMyPreferences);

    const useAdminTeammateNameDisplaySetting = (license && license.LockTeammateNameDisplay === 'true') && config.LockTeammateNameDisplay === 'true';
    const key = getPreferenceKey(Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.NAME_NAME_FORMAT);
    if (preferences[key] && !useAdminTeammateNameDisplaySetting) {
        return preferences[key].value || '';
    } else if (config.TeammateNameDisplay) {
        return config.TeammateNameDisplay;
    }
    return Preferences.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME;
}

export function useUser(userId: string) {
    const dispatch = useDispatch();
    const user = useSelector((state) => getUser(state, userId));

    useEffect(() => {
        if (user) {
            return;
        }

        dispatch(fetchUser(userId));
    });

    return user;
}
