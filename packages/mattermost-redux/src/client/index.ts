// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    Client4,
    DEFAULT_LIMIT_AFTER,
    DEFAULT_LIMIT_BEFORE,
    HEADER_X_VERSION_ID,
} from '@mattermost/client';

const clientInstance = new Client4();

export {
    clientInstance as Client4,
    DEFAULT_LIMIT_AFTER,
    DEFAULT_LIMIT_BEFORE,
    HEADER_X_VERSION_ID,
};
