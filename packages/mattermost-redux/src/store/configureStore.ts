// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {
    applyMiddleware,
    createStore,
    Reducer,
    Store,
} from 'redux';
import thunk from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension/developmentOnly';

import {GlobalState} from 'mattermost-redux/types/store';

import serviceReducers from '../reducers';

import reducerRegistry from './reducer_registry';

import {createReducer} from './helpers';
import initialState from './initial_state';

/**
 * Configures and constructs the redux store. Accepts the following parameters:
 * preloadedState - Any preloaded state to be applied to the store after it is initially configured.
 * appReducer - An object containing any app-specific reducer functions that the client needs.
 * getAppReducers - A function that returns the appReducer as defined above. Only used in development to enable hot reloading.
 */
export default function configureStore<S extends GlobalState>({
    appReducers,
    getAppReducers,
    preloadedState,
}: {
    appReducers: Record<string, Reducer>;
    getAppReducers: () => Record<string, Reducer>;
    preloadedState: Partial<S>;
}): Store {
    const baseState = {
        ...initialState,
        ...preloadedState,
    };

    let middleware = applyMiddleware(thunk);
    middleware = composeWithDevTools({

        // Set this to false to stop actions from being dispatched again when reducers are replaced.
        // See https://github.com/reduxjs/redux-devtools/issues/304#issuecomment-251715413 for more information.
        shouldHotReload: false,
    })(middleware);

    const baseReducer = createReducer(serviceReducers, appReducers);

    const store = createStore(
        baseReducer,
        baseState,
        middleware,
    );

    reducerRegistry.setChangeListener((reducers: Record<string, Reducer>) => {
        store.replaceReducer(createReducer(reducers, serviceReducers, appReducers));
    });

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept(() => {
            const registryReducers = reducerRegistry.getReducers();
            const nextServiceReducers = require('../reducers').default; // eslint-disable-line global-require
            const nextAppReducers = getAppReducers();

            // Ensure registryReducers comes first so that stored service/app reducers are replaced by the new ones
            store.replaceReducer(createReducer(registryReducers, nextServiceReducers, nextAppReducers));
        });
    }

    return store;
}
