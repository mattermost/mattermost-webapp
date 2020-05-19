// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {hot} from 'react-hot-loader/root';
import React from 'react';
import {Provider} from 'react-redux';
import {Router, Route} from 'react-router-dom';

import {browserHistory} from 'utils/browser_history';
import store from 'stores/redux_store.jsx';

import {makeAsyncComponent} from 'components/async_load';
const LazyRoot = React.lazy(() => import('components/root'));

const Root = makeAsyncComponent(LazyRoot);

class App extends React.PureComponent {
    render() {
        return (
            <Provider store={store}>
                <Router history={browserHistory}>
                    <Route
                        path='/'
                        component={Root}
                    />
                </Router>
            </Provider>);
    }
}

export default hot(App);
