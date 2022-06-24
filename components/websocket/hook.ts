// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useContext, useEffect} from 'react';

import {WebSocketMessage} from 'mattermost-redux/types/websocket';

import {Context} from './context';

type WebsocketOptions = {
    handler: (msg: WebSocketMessage) => void;
}

export function useWebsocket(options: WebsocketOptions) {
    const manager = useContext(Context);

    useEffect(() => {
        manager.registerEventHandler(options.handler);

        return () => {
            manager.unregisterEventHandler(options.handler);
        };
    }, [manager, options.handler]);
}
