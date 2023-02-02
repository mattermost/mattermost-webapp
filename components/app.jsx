// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {hot} from 'react-hot-loader/root';
import {Provider} from 'react-redux';
import {Router, Route} from 'react-router-dom';

import {makeAsyncComponent} from 'components/async_load';
import CRTPostsChannelResetWatcher from 'components/threading/channel_threads/posts_channel_reset_watcher';

import {SagaProvider} from 'store/sagas';

import store, {sagaMiddleware} from 'stores/redux_store';

import {getHistory} from 'utils/browser_history';

const LazyRoot = React.lazy(() => import('components/root'));

const Root = makeAsyncComponent('Root', LazyRoot);

function App() {
    return (
        <Provider store={store}>
            <SagaProvider sagaMiddleware={sagaMiddleware}>
                <CRTPostsChannelResetWatcher/>
                <Router history={getHistory()}>
                    <Route
                        path='/'
                        component={Root}
                    />
                </Router>
            </SagaProvider>
        </Provider>
    );
}

export default hot(App);
