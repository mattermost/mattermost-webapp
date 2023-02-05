// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import random from 'lodash/random';

import {WebSocketMessage} from '@mattermost/client';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

/**
 * Wraps an websocket event handler in a jittered timeout function, which is used to add a random delay to the event handling process.
 * @param websocketEventHandler - A websocket event handler.
 * @param websocketMessage - A WebSocketMessage to be passed to the websocketEventHandler.
 * @param shouldDispatch- A flag indicating whether the eventHandler is redux action and should be dispatched. Defaults to true.
 * @param overideJitterRange - If provided, this value will be used instead of the jitter range obtained from the config.
 */
export function wrapEventWithJitter(
    websocketEventHandler: (websocketMessage: WebSocketMessage) => ActionFunc,
    websocketMessage: WebSocketMessage,
    shouldDispatch = true,
    overideJitterRange = 0,
): ActionFunc<null> {
    return (dispatch, getState) => {
        const state = getState();
        const config = getConfig(state);
        const websocketJitterRange = config?.WebsocketJitterRange ?? 0;

        const jitterRange = overideJitterRange === 0 ? websocketJitterRange : overideJitterRange;
        const jitter = random(0, jitterRange);

        setTimeout(() => {
            if (shouldDispatch) {
                // This is how all websocket events should be dispatched, and not from store directly
                // If you are writing a new websocket event, please use this
                dispatch(websocketEventHandler(websocketMessage));
            } else {
                websocketEventHandler(websocketMessage);
            }
        }, jitter);

        return {data: null};
    };
}
