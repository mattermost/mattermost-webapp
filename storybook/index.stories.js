// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Provider} from 'react-redux';
import {Router} from 'react-router-dom';

import {addDecorator} from '@storybook/react';

import IntlProvider from 'components/intl_provider';

import {browserHistory} from 'utils/browser_history';

import store from 'stores/redux_store.jsx';

import 'sass/styles.scss';
import 'storybook/styles.scss';

import {resetTheme} from 'utils/utils';

resetTheme();

addDecorator((storyFn) => (
    <Provider store={store}>
        <IntlProvider>
            <Router history={browserHistory}>
                <div style={{background: 'white'}}>
                    {storyFn()}
                </div>
            </Router>
        </IntlProvider>
    </Provider>
));
