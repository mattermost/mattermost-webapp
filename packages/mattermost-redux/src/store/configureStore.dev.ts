// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createStore, applyMiddleware, Store} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';

import serviceReducer from '../reducers';

import deepFreezeAndThrowOnMutation from 'mattermost-redux/utils/deep_freeze';

import {Reducer, Action} from 'mattermost-redux/types/actions';

import {GlobalState} from 'mattermost-redux/types/store';

import reducerRegistry from './reducer_registry';

import initialState from './initial_state';
import {createReducer} from './helpers';
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
export default function configureServiceStore(preloadedState: any, appReducer: any, persistConfig: any, getAppReducer: any, clientOptions: any): Store {
    const baseState = Object.assign({}, initialState, preloadedState);

    const store = createStore(
        createDevReducer(baseState, serviceReducer, appReducer) as any,
        baseState,
        composeWithDevTools(
            applyMiddleware(...createMiddleware(clientOptions)),
        ),
    );

    reducerRegistry.setChangeListener((reducers: any) => {
        store.replaceReducer(createDevReducer(baseState, reducers) as any);
    });

    // launch store persistor
    if (persistConfig.persist) {
        persistConfig.persist(store, persistConfig.persistOptions, persistConfig.persistCallback);
    }

    if ((module as any).hot) {
    // Enable Webpack hot module replacement for reducers
        (module as any).hot.accept(() => {
            const nextServiceReducer = require('../reducers').default; // eslint-disable-line global-require
            let nextAppReducer;
            if (getAppReducer) {
                nextAppReducer = getAppReducer(); // eslint-disable-line global-require
            }
            store.replaceReducer(createDevReducer(baseState, reducerRegistry.getReducers(), nextServiceReducer, nextAppReducer) as any);
        });
    }

    return store;
}

function createDevReducer(baseState: any, ...reducers: any) {
    return enableFreezing(createReducer(baseState, ...reducers));
}

function enableFreezing(reducer: Reducer) {
    return (state: GlobalState, action: Action) => {
        const nextState = reducer(state, action);

        if (nextState !== state) {
            deepFreezeAndThrowOnMutation(nextState);
        }

        return nextState;
    };
}
