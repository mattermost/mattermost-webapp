// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {createSelector} from 'reselect';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {Preferences} from 'mattermost-redux/constants';
import {ThemeKey} from 'mattermost-redux/types/themes';

export const getAllowedThemes = createSelector('getAllowedThemes', getConfig, (config) => {
    const allowedThemes = (config.AllowedThemes && config.AllowedThemes.split(',')) || [];
    const hasAllowedThemes = allowedThemes.length > 1 || (allowedThemes[0] && allowedThemes[0].trim().length > 0);
    const themesKeys = Object.keys(Preferences.THEMES) as ThemeKey[];
    return themesKeys.filter((key) => !hasAllowedThemes || allowedThemes.indexOf(key) >= 0).map((key) => Preferences.THEMES[key]);
});
