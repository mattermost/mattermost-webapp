// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {General} from '../../constants';

import {getCurrentUser} from '../../selectors/entities/common';

import {GlobalState} from '../../types/store';

export function getCurrentUserLocale(state: GlobalState, defaultLocale = General.DEFAULT_LOCALE) {
    const currentUser = getCurrentUser(state);

    if (!currentUser) {
        return defaultLocale;
    }

    return currentUser.locale || defaultLocale;
}
