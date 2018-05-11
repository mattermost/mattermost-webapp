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
