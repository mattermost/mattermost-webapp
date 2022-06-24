// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useContext, useEffect} from 'react';

import {WebSocketMessage} from 'mattermost-redux/types/websocket';

import {Context} from './context';

type WebsocketOptions = {
    handler: (msg: WebSocketMessage) => void;
    scopes?: string[];
}

export function useWebsocket(options: WebsocketOptions) {
    const manager = useContext(Context);

    useEffect(() => {
        manager.registerEventHandler(options.handler);

        return () => {
            manager.unregisterEventHandler(options.handler);
        };
    }, [manager, options.handler]);

    useEffect(() => {
        const scopes = options.scopes;

        if (scopes && scopes.length > 0) {
            manager.subscribeToScopes(scopes);
        }

        return () => {
            if (scopes && scopes.length > 0) {
                manager.unsubscribeFromScopes(scopes);
            }
        };
    }, [manager, options.scopes]);
}
