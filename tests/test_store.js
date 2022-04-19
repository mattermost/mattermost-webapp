// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {IntlProvider} from 'react-intl';

import {defaultIntl} from './helpers/intl-test-helper';

export default function testConfigureStore(initialState = {}) {
    return configureStore([thunk])(initialState);
}

export function mockStore(initialState = {}, intl = defaultIntl) {
    const store = testConfigureStore(initialState);
    return {
        store,
        mountOptions: intl ? {
            // eslint-disable-next-line react/prop-types
            wrappingComponent: ({children, ...props}) => (
                <IntlProvider {...props}>
                    <Provider store={store}>
                        {children}
                    </Provider>
                </IntlProvider>
            ),
            wrappingComponentProps: {
                ...intl,
            },
        } : {
            wrappingComponent: Provider,
            wrappingComponentProps: {store},
        },
    };
}
