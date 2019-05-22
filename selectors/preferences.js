// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {get} from 'mattermost-redux/selectors/entities/preferences';

import {Preferences} from 'utils/constants';

export function getSendOnCtrlEnterPreferences(state) {
    const value = get(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter', false);

    if (value === 'false') {
        return false;
    }

    if (value === 'true') {
        return true;
    }

    return value;
}