// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createStore, applyMiddleware, Store} from 'redux';

import serviceReducer from '../reducers';

import reducerRegistry from './reducer_registry';

import {createReducer} from './helpers';
import initialState from './initial_state';
import {createMiddleware} from './middleware';

/**
 * Configures and constructs the redux store. Accepts the following parameters:
 * preloadedState - Any preloaded state to be applied to the store after it is initially configured.
 * appReducer - An object containing any app-specific reducer functions that the client needs.
 * persistConfig - Any additional configuration data to be passed into redux-persist aside from the default values.
 * getAppReducer - A function that returns the appReducer as defined above. Only used in development to enable hot reloading.
 * clientOptions - An object containing additional options used when configuring the redux store. The following options are available:
 *     additionalMiddleware - func | array - Allows for single or multiple additional middleware functions to be passed in from the client side.
 *     enableThunk - bool - default = true - If true, include the thunk middleware automatically. If false, thunk must be provided as part of additionalMiddleware.
 */
export default function configureOfflineServiceStore(preloadedState: any, appReducer: any, persistConfig: any, getAppReducer: any, clientOptions = {}): Store {
    const baseState = Object.assign({}, initialState, preloadedState);

    const store = createStore(
        createReducer(baseState, serviceReducer as any, appReducer),
        baseState,
        applyMiddleware(...createMiddleware(clientOptions)),
    );

    reducerRegistry.setChangeListener((reducers: any) => {
        store.replaceReducer(createReducer(baseState, reducers));
    });

    // launch store persistor
    if (persistConfig.persist) {
        persistConfig.persist(store, persistConfig.persistOptions, persistConfig.persistCallback);
    }

    return store;
}
