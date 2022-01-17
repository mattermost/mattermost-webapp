// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Observable from 'zen-observable';
import localForage from 'localforage';
import {extendPrototype} from 'localforage-observable';

import {persistStore, REHYDRATE} from 'redux-persist';

import {General, RequestStatus} from 'mattermost-redux/constants';
import configureServiceStore from 'mattermost-redux/store';

import {clearUserCookie} from 'actions/views/cookie';
import appReducers from 'reducers';
import {getBasePath} from 'selectors/general';

function getAppReducers() {
    return require('../reducers'); // eslint-disable-line global-require
}

window.Observable = Observable;

export default function configureStore(preloadedState) {
    const store = configureServiceStore({
        appReducers,
        getAppReducers,
        preloadedState,
    });

    const localforage = extendPrototype(localForage);

    localforage.ready().then(() => {
        const persistor = persistStore(store, {}, () => {
            store.dispatch({
                type: General.STORE_REHYDRATION_COMPLETE,
                complete: true,
            });
        });

        localforage.configObservables({
            crossTabNotification: true,
        });

        const observable = localforage.newObservable({
            crossTabNotification: true,
            changeDetection: true,
        });

        // Rehydrating when another tab changes
        observable.subscribe({
            next: (args) => {
                if (!args.crossTabNotification) {
                    // Ignore changes made by this tab
                    return;
                }

                const keyPrefix = 'persist:';

                if (!args.key.startsWith(keyPrefix)) {
                    // Ignore changes that weren't made by redux-persist
                    return;
                }

                const key = args.key.substring(keyPrefix.length);
                const newValue = JSON.parse(args.newValue);

                const payload = {};

                for (const reducerKey of Object.keys(newValue)) {
                    if (reducerKey === '_persist') {
                        // Don't overwrite information used by redux-persist itself
                        continue;
                    }

                    payload[reducerKey] = JSON.parse(newValue[reducerKey]);
                }

                store.dispatch({
                    type: REHYDRATE,
                    key,
                    payload,
                });
            },
        });

        let purging = false;

        // Clean up after a logout
        store.subscribe(() => {
            const state = store.getState();
            const basePath = getBasePath(state);

            if (state.requests.users.logout.status === RequestStatus.SUCCESS && !purging) {
                purging = true;

                persistor.purge().then(() => {
                    clearUserCookie();

                    // Preserve any query string parameters on logout, including parameters
                    // used by the application such as extra and redirect_to.
                    window.location.href = `${basePath}${window.location.search}`;

                    setTimeout(() => {
                        purging = false;
                    }, 500);
                });
            }
        });
    }).catch((e) => {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize localforage', e);
    });

    return store;
}
