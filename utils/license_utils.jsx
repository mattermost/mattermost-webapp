// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.
//
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import LocalizationStore from 'stores/localization_store.jsx';
import store from 'stores/redux_store.jsx';

const LICENSE_EXPIRY_NOTIFICATION = 1000 * 60 * 60 * 24 * 60; // 60 days
const LICENSE_GRACE_PERIOD = 1000 * 60 * 60 * 24 * 15; // 15 days

export function isLicenseExpiring() {
    const license = getLicense(store.getState());
    if (license.IsLicensed !== 'true') {
        return false;
    }

    const timeDiff = parseInt(license.ExpiresAt, 10) - Date.now();
    return timeDiff <= LICENSE_EXPIRY_NOTIFICATION;
}

export function isLicenseExpired() {
    const license = getLicense(store.getState());
    if (license.IsLicensed !== 'true') {
        return false;
    }

    const timeDiff = parseInt(license.ExpiresAt, 10) - Date.now();
    return timeDiff < 0;
}

export function isLicensePastGracePeriod() {
    const license = getLicense(store.getState());
    if (license.IsLicensed !== 'true') {
        return false;
    }

    const timeDiff = Date.now() - parseInt(license.ExpiresAt, 10);
    return timeDiff > LICENSE_GRACE_PERIOD;
}

export function displayExpiryDate() {
    const license = getLicense(store.getState());
    const date = new Date(parseInt(license.ExpiresAt, 10));
    return date.toLocaleString(LocalizationStore.getLocale(), {year: 'numeric', month: 'long', day: 'numeric'});
}
