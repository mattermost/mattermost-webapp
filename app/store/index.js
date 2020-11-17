// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint max-nested-callbacks: ["error", 3] */

import Observable from 'zen-observable';
import localForage from 'localforage';
import {extendPrototype} from 'localforage-observable';
import {createTransform, persistStore} from 'redux-persist';
import {General, RequestStatus} from 'mattermost-redux/constants';
import configureServiceStore from 'mattermost-redux/store';
import reduxInitialState from 'mattermost-redux/store/initial_state';

import {storageRehydrate} from 'actions/storage';
import {clearUserCookie} from 'actions/views/cookie';
import appReducer from 'reducers';
import {transformSet} from 'store/utils';
import {detect} from 'utils/network.js';
import {ActionTypes} from 'utils/constants';
import {getBasePath} from 'selectors/general';

function getAppReducer() {
    return require('../reducers'); // eslint-disable-line global-require
}

const usersSetTransform = [
    'profilesInChannel',
    'profilesNotInChannel',
    'profilesInTeam',
    'profilesNotInTeam',
];

const teamSetTransform = [
    'membersInTeam',
];

const setTransforms = [
    ...usersSetTransform,
    ...teamSetTransform,
];

// This is a hack to get the whitelist to work with our storage keys
// We will implement it properly when we eventually upgrade redux-persist
const whitelist = {
    keys: [], // add normal whitelist keys here
    prefixes: ['storage'], // add any whitelist prefixes here
    indexOf: function indexOf(key) {
        if (this.keys.indexOf(key) !== -1) {
            return 0;
        }

        for (let i = 0; i < this.prefixes.length; i++) {
            if (key.startsWith(this.prefixes[i])) {
                return 0;
            }
        }

        return -1;
    },
};

window.Observable = Observable;

export default function configureStore(initialState) {
    const setTransformer = createTransform(
        (inboundState, key) => {
            if (key === 'entities') {
                const state = {...inboundState};
                for (const prop in state) {
                    if (state.hasOwnProperty(prop)) {
                        state[prop] = transformSet(state[prop], setTransforms);
                    }
                }

                return state;
            }

            return inboundState;
        },
        (outboundState, key) => {
            if (key === 'entities') {
                const state = {...outboundState};
                for (const prop in state) {
                    if (state.hasOwnProperty(prop)) {
                        state[prop] = transformSet(state[prop], setTransforms, false);
                    }
                }

                return state;
            }

            return outboundState;
        },
    );

    const offlineOptions = {
        persist: (store, options) => {
            const localforage = extendPrototype(localForage);
            const storage = localforage;
            const KEY_PREFIX = 'reduxPersist:';

            localforage.ready().then(() => {
                const persistor = persistStore(store, {storage, keyPrefix: KEY_PREFIX, ...options}, () => {
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

                const restoredState = {};
                localforage.iterate((value, key) => {
                    if (key && key.indexOf(KEY_PREFIX + 'storage:') === 0) {
                        const keyspace = key.substr((KEY_PREFIX + 'storage:').length);
                        restoredState[keyspace] = value;
                    }
                }).then(() => {
                    storageRehydrate(restoredState, persistor)(store.dispatch, store.getState);
                });

                observable.subscribe({
                    next: (args) => {
                        if (args.key && args.key.indexOf(KEY_PREFIX + 'storage:') === 0 && args.oldValue === null) {
                            const keyspace = args.key.substr((KEY_PREFIX + 'storage:').length);

                            var statePartial = {};
                            statePartial[keyspace] = args.newValue;
                            storageRehydrate(statePartial, persistor)(store.dispatch, store.getState);
                        }
                    },
                });

                let purging = false;

                // check to see if the logout request was successful
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

                            store.dispatch({
                                type: General.OFFLINE_STORE_RESET,
                                data: Object.assign({}, reduxInitialState, initialState),
                            });

                            setTimeout(() => {
                                purging = false;
                            }, 500);
                        });
                    }
                });
            }).catch((error) => {
                store.dispatch({
                    type: ActionTypes.STORE_REHYDRATION_FAILED,
                    error,
                });
            });
        },
        persistOptions: {
            autoRehydrate: {
                log: false,
            },
            whitelist,
            debounce: 30,
            transforms: [
                setTransformer,
            ],
            _stateIterator: (collection, callback) => {
                return Object.keys(collection).forEach((key) => {
                    if (key === 'storage') {
                        Object.keys(collection.storage.storage).forEach((storageKey) => {
                            callback(collection.storage.storage[storageKey], 'storage:' + storageKey);
                        });
                    } else {
                        callback(collection[key], key);
                    }
                });
            },
            _stateGetter: (state, key) => {
                if (key.indexOf('storage:') === 0) {
                    state.storage = state.storage || {storage: {}};
                    return state.storage.storage[key.substr(8)];
                }
                return state[key];
            },
            _stateSetter: (state, key, value) => {
                if (key.indexOf('storage:') === 0) {
                    state.storage = state.storage || {storage: {}};
                    state.storage.storage[key.substr(8)] = value;
                }
                state[key] = value;
                return state;
            },
        },
        detectNetwork: detect,
    };

    return configureServiceStore(initialState, appReducer, offlineOptions, getAppReducer, {enableBuffer: false});
}
