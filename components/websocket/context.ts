// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Client4} from '@mattermost/client';

import {WebSocketMessage} from 'mattermost-redux/types/websocket';

import * as WebsocketActions from 'actions/websocket_actions';

import WebsocketClient from 'client/web_websocket_client';

export const Context = React.createContext<WebsocketManager>(null!);

export class WebsocketManager {
    private client: Client4;
    private currentUserId = '';

    constructor(client: Client4) {
        // TODO find a better way to pass this into WebSocketActions so that it's not just using the global instance directly
        this.client = client;
    }

    public setCurrentUserId(currentUserId: string) {
        if (this.currentUserId && currentUserId) {
            // Disconnect and reconnect as the new user
            WebsocketActions.close();
            WebsocketActions.initialize();
        } else if (currentUserId) {
            // Connect as the new user
            WebsocketActions.initialize();
        } else if (this.currentUserId) {
            // We've logged out, so disconnect the websocket
            WebsocketActions.close();
        }

        this.currentUserId = currentUserId;
    }

    public registerEventHandler<T>(handler: (msg: WebSocketMessage<T>) => void) {
        WebsocketActions.registerEventHandler(handler);
    }

    public unregisterEventHandler<T>(handler: (msg: WebSocketMessage<T>) => void) {
        WebsocketActions.unregisterEventHandler(handler);
    }

    public subscribeToScopes(scopes: string[]) {
        // TODO we need to hold onto these to reconnect after the websocket reconnects
        WebsocketClient.sendMessage('subscribe', {scopes});
    }

    public unsubscribeFromScopes(scopes: string[]) {
        WebsocketClient.sendMessage('unsubscribe', {scopes});
    }
}
