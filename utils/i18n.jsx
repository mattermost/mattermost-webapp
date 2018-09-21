// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function getMonthLong(locale) {
    if (locale === 'ko') {
        // Long and short are equivalent in Korean except long has a bug on IE11/Windows 7
        return 'short';
    }

    return 'long';
}

export function t(v) {
    return v;
}
