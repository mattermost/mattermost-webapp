// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getCurrentUserLocale} from 'mattermost-redux/selectors/entities/i18n';

// This is a placeholder for if we ever implement browser-locale detection
export function getCurrentLocale(state) {
    return getCurrentUserLocale(state);
}
