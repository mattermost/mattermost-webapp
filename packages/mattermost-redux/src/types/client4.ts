// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

type ErrorOffline = {
    message: string;
    url: string;
};
type ErrorInvalidResponse = {
    intl: {
        id: string;
        defaultMessage: string;
    };
};
export type ErrorApi = {
    message: string;
    server_error_id: string;
    status_code: number;
    url: string;
};
export type Client4Error = ErrorOffline | ErrorInvalidResponse | ErrorApi;
