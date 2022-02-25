// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PreferenceType} from '../../../../packages/mattermost-redux/src/types/preferences';
import {Preferences} from '../../../../packages/mattermost-redux/src/constants';

export function getPreferenceWithHideInVisualTesting(
    userId: string,
    hideValue: string,
    themeValue?: string,
    teamId?: string
) {
    const theme =
        themeValue && Preferences.THEMES[themeValue] ? Preferences.THEMES[themeValue] : Preferences.THEMES.denim;
    const preference: PreferenceType = {
        user_id: userId,
        category: Preferences.CATEGORY_THEME,
        name: teamId || '',
        value: JSON.stringify({...theme, type: 'custom', hideInVisualTesting: hideValue}),
    };

    return preference;
}
