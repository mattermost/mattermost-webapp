// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {General, Preferences} from 'mattermost-redux/constants';

import {getConfig, getFeatureFlagValue, getLicense} from 'mattermost-redux/selectors/entities/general';

import {AddChannelButtonTreatments} from 'mattermost-redux/constants/config';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import {GlobalState} from 'mattermost-redux/types/store';
import {Theme} from 'mattermost-redux/types/themes';

import {createShallowSelector} from 'mattermost-redux/utils/helpers';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';
import {setThemeDefaults} from 'mattermost-redux/utils/theme_utils';

export function getMyPreferences(state: GlobalState): { [x: string]: PreferenceType } {
    return state.entities.preferences.myPreferences;
}

export function get(state: GlobalState, category: string, name: string, defaultValue: any = '') {
    const key = getPreferenceKey(category, name);
    const prefs = getMyPreferences(state);

    if (!(key in prefs)) {
        return defaultValue;
    }

    return prefs[key].value;
}

export function getBool(state: GlobalState, category: string, name: string, defaultValue = false): boolean {
    const value = get(state, category, name, String(defaultValue));
    return value !== 'false';
}

export function getInt(state: GlobalState, category: string, name: string, defaultValue = 0): number {
    const value = get(state, category, name, defaultValue);
    return parseInt(value, 10);
}

export function makeGetCategory(): (state: GlobalState, category: string) => PreferenceType[] {
    return createSelector(
        'makeGetCategory',
        getMyPreferences,
        (state: GlobalState, category: string) => category,
        (preferences, category) => {
            const prefix = category + '--';
            const prefsInCategory: PreferenceType[] = [];

            for (const key in preferences) {
                if (key.startsWith(prefix)) {
                    prefsInCategory.push(preferences[key]);
                }
            }

            return prefsInCategory;
        },
    );
}

const getDirectShowCategory = makeGetCategory();

export function getDirectShowPreferences(state: GlobalState) {
    return getDirectShowCategory(state, Preferences.CATEGORY_DIRECT_CHANNEL_SHOW);
}

const getGroupShowCategory = makeGetCategory();

export function getGroupShowPreferences(state: GlobalState) {
    return getGroupShowCategory(state, Preferences.CATEGORY_GROUP_CHANNEL_SHOW);
}

export const getTeammateNameDisplaySetting: (state: GlobalState) => string = createSelector(
    'getTeammateNameDisplaySetting',
    getConfig,
    getMyPreferences,
    getLicense,
    (config, preferences, license) => {
        const useAdminTeammateNameDisplaySetting = (license && license.LockTeammateNameDisplay === 'true') && config.LockTeammateNameDisplay === 'true';
        const key = getPreferenceKey(Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.NAME_NAME_FORMAT);
        if (preferences[key] && !useAdminTeammateNameDisplaySetting) {
            return preferences[key].value || '';
        } else if (config.TeammateNameDisplay) {
            return config.TeammateNameDisplay;
        }
        return General.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME;
    },
);

const getThemePreference = createSelector(
    'getThemePreference',
    getMyPreferences,
    (state) => state.entities.teams.currentTeamId,
    (myPreferences, currentTeamId) => {
        // Prefer the user's current team-specific theme over the user's current global theme
        let themePreference;

        if (currentTeamId) {
            themePreference = myPreferences[getPreferenceKey(Preferences.CATEGORY_THEME, currentTeamId)];
        }

        if (!themePreference) {
            themePreference = myPreferences[getPreferenceKey(Preferences.CATEGORY_THEME, '')];
        }

        return themePreference;
    },
);

const getDefaultTheme = createSelector('getDefaultTheme', getConfig, (config): Theme => {
    if (config.DefaultTheme && config.DefaultTheme in Preferences.THEMES) {
        const theme: Theme = Preferences.THEMES[config.DefaultTheme];
        if (theme) {
            return theme;
        }
    }

    // If no config.DefaultTheme or value doesn't refer to a valid theme name...
    return Preferences.THEMES.denim;
});

export const getTheme: (state: GlobalState) => Theme = createShallowSelector(
    'getTheme',
    getThemePreference,
    getDefaultTheme,
    (themePreference, defaultTheme): Theme => {
        const themeValue: Theme | string = themePreference?.value ?? defaultTheme;

        // A custom theme will be a JSON-serialized object stored in a preference
        // At this point, the theme should be a plain object
        const theme: Theme = typeof themeValue === 'string' ? JSON.parse(themeValue) : themeValue;

        return setThemeDefaults(theme);
    },
);

export function makeGetStyleFromTheme<Style>(): (state: GlobalState, getStyleFromTheme: (theme: Theme) => Style) => Style {
    return createSelector(
        'makeGetStyleFromTheme',
        getTheme,
        (state: GlobalState, getStyleFromTheme: (theme: Theme) => Style) => getStyleFromTheme,
        (theme, getStyleFromTheme) => {
            return getStyleFromTheme(theme);
        },
    );
}

// shouldShowUnreadsCategory returns true if the user has unereads grouped separately with the new sidebar enabled.
export const shouldShowUnreadsCategory: (state: GlobalState) => boolean = createSelector(
    'shouldShowUnreadsCategory',
    (state: GlobalState) => get(state, Preferences.CATEGORY_SIDEBAR_SETTINGS, Preferences.SHOW_UNREAD_SECTION),
    (state: GlobalState) => get(state, Preferences.CATEGORY_SIDEBAR_SETTINGS, ''),
    (state: GlobalState) => getConfig(state).ExperimentalGroupUnreadChannels,
    (userPreference, oldUserPreference, serverDefault) => {
        // Prefer the show_unread_section user preference over the previous version
        if (userPreference) {
            return userPreference === 'true';
        }

        if (oldUserPreference) {
            return JSON.parse(oldUserPreference).unreads_at_top === 'true';
        }

        // The user setting is not set, so use the system default
        return serverDefault === General.DEFAULT_ON;
    },
);

export function getCollapsedThreadsPreference(state: GlobalState): string {
    const configValue = getConfig(state)?.CollapsedThreads;
    let preferenceDefault = Preferences.COLLAPSED_REPLY_THREADS_OFF;

    if (configValue === 'default_on') {
        preferenceDefault = Preferences.COLLAPSED_REPLY_THREADS_ON;
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

export function isTimedDNDEnabled(state: GlobalState): boolean {
    return (
        getFeatureFlagValue(state, 'TimedDND') === 'true'
    );
}

export function isGroupChannelManuallyVisible(state: GlobalState, channelId: string): boolean {
    return getBool(state, Preferences.CATEGORY_GROUP_CHANNEL_SHOW, channelId, false);
}

export function getAddChannelButtonTreatment(state: GlobalState): AddChannelButtonTreatments | undefined {
    return getFeatureFlagValue(state, 'AddChannelButton') as AddChannelButtonTreatments | undefined;
}
