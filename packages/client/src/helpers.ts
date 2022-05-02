// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function buildQueryString(parameters: Record<string, any>): string {
    const keys = Object.keys(parameters);
    if (keys.length === 0) {
        return '';
    }

    let query = '';
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (parameters[key] !== undefined) {
            query += `${query.length === 0 ? '?' : '&'}${key}=${encodeURIComponent(parameters[key])}`;
        }
    }

    return query;
}
