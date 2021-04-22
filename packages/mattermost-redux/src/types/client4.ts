// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// I assume these are the log levels
export type LogLevel = 'ERROR' | 'WARNING' | 'INFO';

// TODO remove
export type ClientResponse<T> = {
    response: Response;
    headers: Map<string, string>;
    data: T;
};

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

// TODO remove
export type Options = {
    headers?: { [x: string]: string };
    method?: string;
    url?: string;
    credentials?: 'omit' | 'same-origin' | 'include';
    body?: any;
};

// TODO remove
export type StatusOK = {
    status: 'OK';
};
