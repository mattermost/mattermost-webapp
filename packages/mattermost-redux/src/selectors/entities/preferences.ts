// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {General, Preferences} from 'mattermost-redux/constants';

import {
    getConfig,
    getFeatureFlagValue,
    getLicense,
    getOsColorScheme,
} from 'mattermost-redux/selectors/entities/general';

import {AddChannelButtonTreatments, DownloadAppsCTATreatments, PrewrittenMessagesTreatments} from 'mattermost-redux/constants/config';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import {GlobalState} from 'mattermost-redux/types/store';
import {Theme} from 'mattermost-redux/types/themes';

import {createShallowSelector, isMinimumServerVersion} from 'mattermost-redux/utils/helpers';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';
import {setThemeDefaults} from 'mattermost-redux/utils/theme_utils';

// getCurrentTeamId duplicated from 'mattermost-redux/selectors/entities/teams' because jest module mock didn't work
const getCurrentTeamId = (state: GlobalState) => state.entities.teams.currentTeamId;

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

export const isThemeSyncWithOsAvailable = (state: GlobalState): boolean => {
    const version = state.entities.general.serverVersion;
    return isMinimumServerVersion(version, 6, 0);
};

export const getEnableThemeSync = createSelector(
    'getEnableThemeSync',
    isThemeSyncWithOsAvailable,
    getCurrentTeamId,
    getMyPreferences,
    (themeSyncWithOsAvailable, currentTeamId, preferences) => {
        if (!themeSyncWithOsAvailable) {
            return false;
        }
        const preference = preferences[getPreferenceKey(Preferences.CATEGORY_ENABLE_THEME_SYNC, currentTeamId)] ||
            preferences[getPreferenceKey(Preferences.CATEGORY_ENABLE_THEME_SYNC, '')];
        return !preference || preference.value === 'true';
    },
);

export const getDefaultLightTheme = createSelector('getDefaultLightTheme', getConfig, (config) => {
    if (config.DefaultTheme && config.DefaultTheme in Preferences.THEMES) {
        const theme = Preferences.THEMES[config.DefaultTheme];
        if (theme) {
            return theme;
        }
    }

    // If no config.DefaultTheme or value doesn't refer to a valid theme name...
    return Preferences.THEMES.denim;
});

const getLightThemePreference = createShallowSelector(
    'getLightThemePreference',
    getCurrentTeamId,
    getMyPreferences,
    (currentTeamId, myPreferences) => {
        return myPreferences[getPreferenceKey(Preferences.CATEGORY_THEME, currentTeamId)] ||
            myPreferences[getPreferenceKey(Preferences.CATEGORY_THEME, '')];
    },
);

export const getLightTheme = createShallowSelector(
    'getLightTheme',
    getDefaultLightTheme,
    getLightThemePreference,
    (defaultLightTheme, lightThemePreference) => {
        return normalizeTheme(lightThemePreference ? lightThemePreference.value : defaultLightTheme);
    },
);

const getDefaultDarkTheme = () => Preferences.THEMES.indigo;

const getDarkThemePreference = createShallowSelector(
    'getDarkThemePreference',
    getCurrentTeamId,
    getMyPreferences,
    (currentTeamId, myPreferences) => {
        return myPreferences[getPreferenceKey(Preferences.CATEGORY_THEME_DARK, currentTeamId)] ||
            myPreferences[getPreferenceKey(Preferences.CATEGORY_THEME_DARK, '')];
    },
);

export const getDarkTheme = createShallowSelector(
    'getDarkTheme',
    getDefaultDarkTheme,
    getDarkThemePreference,
    (defaultDarkTheme, darkThemePreference) => {
        return normalizeTheme(darkThemePreference ? darkThemePreference.value : defaultDarkTheme);
    },
);

export const getTheme = createShallowSelector(
    'getTheme',
    getLightThemePreference,
    getDarkThemePreference,
    getEnableThemeSync,
    getOsColorScheme,
    getDefaultDarkTheme,
    getDefaultLightTheme,
    (lightThemePreference, darkThemePreference, enableThemeSync, osColorScheme, defaultDarkTheme, defaultLightTheme) => {
        const isDarkActive = enableThemeSync && osColorScheme === 'dark';
        const themePreference = isDarkActive ? darkThemePreference : lightThemePreference;
        const defaultTheme = isDarkActive ? defaultDarkTheme : defaultLightTheme;
        return normalizeTheme(themePreference ? themePreference.value : defaultTheme);
    },
);

const normalizeTheme = (themeValue: any) => {
    const theme: Theme = typeof themeValue === 'string' ? JSON.parse(themeValue) : themeValue;
    return setThemeDefaults(theme);
};

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

export function getDownloadAppsCTATreatment(state: GlobalState): DownloadAppsCTATreatments | undefined {
    return getFeatureFlagValue(state, 'DownloadAppsCTA') as DownloadAppsCTATreatments | undefined;
}

export function getPrewrittenMessagesTreatment(state: GlobalState): PrewrittenMessagesTreatments | undefined {
    return getFeatureFlagValue(state, 'PrewrittenMessages') as PrewrittenMessagesTreatments | undefined;
}
