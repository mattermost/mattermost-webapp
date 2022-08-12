// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from '@mattermost/types/users';

import Preferences from '../constants/preferences';

import {localizeMessage} from './i18n';

export function getFullName(user: UserProfile): string {
    if (user.first_name && user.last_name) {
        return user.first_name + ' ' + user.last_name;
    } else if (user.first_name) {
        return user.first_name;
    } else if (user.last_name) {
        return user.last_name;
    }

    return '';
}

export function displayUsername(
    user: UserProfile | null | undefined,
    teammateNameDisplay: string,
    useFallbackUsername = true,
): string {
    let name = useFallbackUsername ? localizeMessage('channel_loader.someone', 'Someone') : '';
    if (user) {
        if (teammateNameDisplay === Preferences.DISPLAY_PREFER_NICKNAME) {
            name = user.nickname || getFullName(user);
        } else if (teammateNameDisplay === Preferences.DISPLAY_PREFER_FULL_NAME) {
            name = getFullName(user);
        } else {
            name = user.username;
        }

        if (!name || name.trim().length === 0) {
            name = user.username;
        }
    }

    return name;
}
