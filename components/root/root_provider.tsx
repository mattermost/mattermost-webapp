// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';

import {useSelector} from 'react-redux';

import WebSocketClient from 'client/web_websocket_client';

import IntlProvider from 'components/intl_provider';

import {WebSocketContext} from 'utils/use_websocket';
import {getCurrentLocale} from 'selectors/i18n';

type Props = {
    children: React.ReactNode;
}

export default function RootProvider(props: Props) {
    const locale = useSelector(getCurrentLocale);

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    return (
        <IntlProvider>
            <WebSocketContext.Provider value={WebSocketClient}>
                {props.children}
            </WebSocketContext.Provider>
        </IntlProvider>
    );
}
