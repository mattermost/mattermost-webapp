// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type ServerError = {
    server_error_id?: string;
    stack?: string;
    message: string;
    status_code?: number;
    url?: string;
};
