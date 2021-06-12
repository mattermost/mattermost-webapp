// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createStore, applyMiddleware, Store, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension/developmentOnly';

import {GlobalState} from 'mattermost-redux/types/store';
import {Action, Reducer} from 'mattermost-redux/types/actions';

import serviceReducer from '../reducers';

import reducerRegistry from './reducer_registry';

import {createReducer} from './helpers';
import initialState from './initial_state';

/**
 * Configures and constructs the redux store. Accepts the following parameters:
 * preloadedState - Any preloaded state to be applied to the store after it is initially configured.
 * appReducer - An object containing any app-specific reducer functions that the client needs.
 * persistConfig - Any additional configuration data to be passed into redux-persist aside from the default values.
 * getAppReducer - A function that returns the appReducer as defined above. Only used in development to enable hot reloading.
 */
export default function configureStore(preloadedState: any, appReducer: any, persistConfig: any, getAppReducer: any): Store {
    const baseState = Object.assign({}, initialState, preloadedState);

    let middleware = applyMiddleware(thunk);
    middleware = composeWithDevTools(middleware);

    const store = createStore(
        createReducer(baseState, serviceReducer as any, appReducer),
        baseState,
        middleware,
    );

    reducerRegistry.setChangeListener((reducers: any) => {
        store.replaceReducer(createReducer(baseState, reducers));
    });

    // launch store persistor
    if (persistConfig.persist) {
        persistConfig.persist(store, persistConfig.persistOptions, persistConfig.persistCallback);
    }

    if (module.hot) {
    // Enable Webpack hot module replacement for reducers
        module.hot.accept(() => {
            const nextServiceReducer = require('../reducers').default; // eslint-disable-line global-require
            let nextAppReducer;
            if (getAppReducer) {
                nextAppReducer = getAppReducer(); // eslint-disable-line global-require
            }
            const registryReducers = combineReducers(reducerRegistry.getReducers()) as Reducer<GlobalState, Action>;

            store.replaceReducer(createReducer(baseState, registryReducers, nextServiceReducer, nextAppReducer));
        });
    }

    return store;
}
