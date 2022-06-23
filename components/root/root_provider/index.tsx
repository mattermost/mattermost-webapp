// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as React from 'react';

import {Client4} from 'mattermost-redux/client';

import IntlProvider from 'components/intl_provider';
import {WebsocketProvider} from 'components/websocket';

type Props = {
    children: React.ReactNode;
}

export default function RootProvider(props: Props) {
    return (
        <IntlProvider>
            <WebsocketProvider client={Client4}>
                {props.children}
            </WebsocketProvider>
        </IntlProvider>
    );
}
