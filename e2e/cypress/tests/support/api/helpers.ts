// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.


export function buildQueryString(queryParams: Record<string, Parameters<typeof encodeURIComponent>[0]> = {}): string {
    let queryString = '';
    Object.entries(queryParams).forEach(([k, v], index) => {
        if (index > 0) {
            queryString += '&';
        }

        queryString += `${k}=${encodeURIComponent(v)}`;
    });

    return queryString;
}
