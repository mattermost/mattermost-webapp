// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const LICENSE_EXPIRY_NOTIFICATION = 1000 * 60 * 60 * 24 * 14; // 14 days
const LICENSE_GRACE_PERIOD = 1000 * 60 * 60 * 24 * 10; // 10 days

export function isLicenseExpiring(license) {
    if (license.IsLicensed !== 'true') {
        return false;
    }

    const timeDiff = parseInt(license.ExpiresAt, 10) - Date.now();
    return timeDiff <= LICENSE_EXPIRY_NOTIFICATION;
}

export function isLicenseExpired(license) {
    if (license.IsLicensed !== 'true') {
        return false;
    }

    const timeDiff = parseInt(license.ExpiresAt, 10) - Date.now();
    return timeDiff < 0;
}

export function isLicensePastGracePeriod(license) {
    if (license.IsLicensed !== 'true') {
        return false;
    }

    const timeDiff = Date.now() - parseInt(license.ExpiresAt, 10);
    return timeDiff > LICENSE_GRACE_PERIOD;
}

export function isTrialLicense(license) {
    if (license.IsLicensed !== 'true') {
        return false;
    }

    // Currently all trial licenses are issued with a 30 day, 8 hours duration.
    // We're using this logic to detect a trial license until
    // we add the right field in the license itself.
    const timeDiff = parseInt(license.ExpiresAt, 10) - parseInt(license.StartsAt, 10);
    const trialLicenseDuration = (1000 * 60 * 60 * 24 * 30) + (1000 * 60 * 60 * 8); // 30 days + 8 hours
    return timeDiff <= trialLicenseDuration;
}
