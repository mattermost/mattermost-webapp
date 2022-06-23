// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef} from 'react';

import {Client4} from '@mattermost/client';

import {Context, WebsocketManager} from '../context';

type Props = {
    children: React.ReactNode;
    client: Client4;
    currentUserId: string;
}

export default function Provider(props: Props) {
    // This assumes props.client never changes
    const manager = useRef(new WebsocketManager(props.client));

    useEffect(() => {
        manager.current.setCurrentUserId(props.currentUserId);
    }, [props.currentUserId]);

    useEffect(() => {
        const closeWebsocket = () => manager.current.setCurrentUserId('');

        window.addEventListener('beforeunload', closeWebsocket);

        return () => {
            closeWebsocket();

            window.removeEventListener('beforeunload', closeWebsocket);
        };
    }, []);

    return (
        <Context.Provider value={manager.current}>
            {props.children}
        </Context.Provider>
    );
}
