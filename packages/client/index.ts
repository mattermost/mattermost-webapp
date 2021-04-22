// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Client4, {
    AUTOCOMPLETE_LIMIT_DEFAULT,
    DEFAULT_LIMIT_AFTER,
    DEFAULT_LIMIT_BEFORE,
    HEADER_X_VERSION_ID,
} from './src/client4';
import {buildQueryString, isMinimumServerVersion} from './src/helpers';
import WebSocketClient from './src/websocket_client';

export {
    AUTOCOMPLETE_LIMIT_DEFAULT,
    buildQueryString,
    Client4,
    DEFAULT_LIMIT_AFTER,
    DEFAULT_LIMIT_BEFORE,
    HEADER_X_VERSION_ID,
    isMinimumServerVersion,
    WebSocketClient,
};
