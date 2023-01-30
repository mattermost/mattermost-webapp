// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import random from 'lodash/random';

import {WebSocketMessage} from '@mattermost/client';
import {ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';

const JITTER_RANGE = 2000; // 2 seconds

export function wrapEventWithJitter(
    eventHandler: (websocketMessage: WebSocketMessage) => ActionFunc,
    websocketMessage: WebSocketMessage,
    dispatch: DispatchFunc | null = null,
) {
    const jitter = random(0, JITTER_RANGE);

    setTimeout(() => {
        if (dispatch) {
            // This is how all websocket events should be dispatched, and not from store directly
            // If you are writing a new websocket event, please use this
            dispatch(eventHandler(websocketMessage));
        } else {
            eventHandler(websocketMessage);
        }
    }, jitter);
}
