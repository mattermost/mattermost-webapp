// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Constants from 'utils/constants';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'types/store';
import {getFeatureFlagValue} from 'mattermost-redux/selectors/entities/general';

const Preferences = Constants.Preferences;

export function getGlobalHeaderEnabled(state: GlobalState): boolean {
    const featureFlagEnabled = getFeatureFlagValue(state, 'GlobalHeader') === 'true';
    const userPreferenceEnabled = get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.GLOBAL_HEADER_DISPLAY, Preferences.GLOBAL_HEADER_DISPLAY_DEFAULT) === Preferences.GLOBAL_HEADER_DISPLAY_ON;

    return featureFlagEnabled && userPreferenceEnabled;
}
