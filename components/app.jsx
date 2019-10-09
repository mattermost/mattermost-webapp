// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {hot} from 'react-hot-loader/root';
import React from 'react';
import {Provider} from 'react-redux';
import {Router, Route} from 'react-router-dom';

import {browserHistory} from 'utils/browser_history';
import store from 'stores/redux_store.jsx';

const Root = React.lazy(() => import('components/root'));

class App extends React.Component {
    render() {
        return (
            <React.Suspense fallback={null}>
                <Provider store={store}>
                    <Router history={browserHistory}>
                        <Route
                            path='/'
                            component={Root}
                        />
                    </Router>
                </Provider>
            </React.Suspense>);
    }
}

export default hot(App);
