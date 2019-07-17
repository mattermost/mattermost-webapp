// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Compare server versions, ignoring the configuration hash and licensed status.
 *
 * For example, the following two server versions are considered equal:
 *     4.7.1.dev.3034fbc5fd566195d1b53e03890e35ff.true
 *     4.7.1.dev.d131dd02c5e6eec4693d9a0698aff95c.false
 *
 * but the following two are not
 *     4.7.0.dev.3034fbc5fd566195d1b53e03890e35ff.true
 *     4.7.1.dev.d131dd02c5e6eec4693d9a0698aff95c.true
 */
export function equalServerVersions(a, b) {
    if (a === b) {
        return true;
    }

    const ignoredComponents = 2;
    const aIgnoringComponents = (a || '').split('.').slice(0, -ignoredComponents).join('.');
    const bIgnoringComponents = (b || '').split('.').slice(0, -ignoredComponents).join('.');
    if (aIgnoringComponents === bIgnoringComponents) {
        return true;
    }

    return false;
}

/**
 * Boolean function to check if a server version is greater than another.
 *
 * currentVersion: The server version being checked
 * compareVersion: The version to compare the former version against
 *
 * eg.  currentVersion = 4.16.0, compareVersion = 4.17.0 returns false
 *      currentVersion = 4.16.1, compareVersion = 4.16.1 returns true
 */
export function isServerVersionGreaterThanOrEqualTo(currentVersion, compareVersion) {
    if (currentVersion === compareVersion) {
        return true;
    }

    // We only care about the numbers
    const currentVersionNumber = (currentVersion || '').split('.').filter((x) => (/^[0-9]+$/).exec(x) !== null);
    const compareVersionNumber = (compareVersion || '').split('.').filter((x) => (/^[0-9]+$/).exec(x) !== null);

    for (var i = 0; i < Math.max(currentVersionNumber.length, compareVersionNumber.length); i++) {
        if ((currentVersionNumber[i] || 0) > (compareVersionNumber[i] || 0)) {
            return true;
        }

        if ((currentVersionNumber[i] || 0) < (compareVersionNumber[i] || 0)) {
            return false;
        }
    }

    // If all components are equal, then return true
    return true;
}
