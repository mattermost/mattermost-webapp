// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getConfig, getFeatureFlagValue} from 'mattermost-redux/selectors/entities/general';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';
import {Preferences} from 'utils/constants';

export function getCollapsedThreadsPreference(state: GlobalState) {
    const configValue = getConfig(state).CollapsedThreads;
    let preferenceDefault;

    switch (configValue) {
    case 'default_off':
        preferenceDefault = Preferences.COLLAPSED_REPLY_THREADS_OFF;
        break;
    case 'default_on':
        preferenceDefault = Preferences.COLLAPSED_REPLY_THREADS_ON;
        break;
    }

    return get(
        state,
        Preferences.CATEGORY_DISPLAY_SETTINGS,
        Preferences.COLLAPSED_REPLY_THREADS,
        preferenceDefault ?? Preferences.COLLAPSED_REPLY_THREADS_FALLBACK_DEFAULT,
    );
}

export function isCollapsedThreadsAllowed(state: GlobalState): boolean {
    return (
        getFeatureFlagValue(state, 'CollapsedThreads') === 'true' &&
        getConfig(state).CollapsedThreads !== 'disabled'
    );
}

export function isCollapsedThreadsEnabled(state: GlobalState): boolean {
    const isAllowed = isCollapsedThreadsAllowed(state);
    const userPreference = getCollapsedThreadsPreference(state);

    return isAllowed && (userPreference === Preferences.COLLAPSED_REPLY_THREADS_ON || getConfig(state).CollapsedThreads as string === 'always_on');
}
