// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type ServerError = Error & {
    type?: string;
    server_error_id?: string;
    stack?: string;
    message: string;
    status_code?: number;
    url?: string;
};

export function isServerError(err: any): err is ServerError {
    return 'server_error_id' in err ||
        'intl' in err ||
        'status_code' in err ||
        'url' in err;
}
