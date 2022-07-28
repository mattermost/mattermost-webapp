// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export {
    default as Client4,
    ClientError,
    DEFAULT_LIMIT_AFTER,
    DEFAULT_LIMIT_BEFORE,
} from './client4';

export type {TelemetryHandler} from './telemetry';
export type {WebSocketMessage} from './websocket';
// eslint-disable-next-line no-duplicate-imports
export {default as WebSocketClient} from './websocket';
