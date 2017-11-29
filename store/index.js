// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {batchActions} from 'redux-batched-actions';

import localForage from "localforage";
import { extendPrototype } from "localforage-observable";

import {General, RequestStatus} from 'mattermost-redux/constants';
import configureServiceStore from 'mattermost-redux/store';
import reduxInitialState from 'mattermost-redux/store/initial_state';
import {createTransform, persistStore} from 'mattermost-redux/store/persist';

import {storageRehydrate} from 'actions/storage';

import appReducer from 'reducers';

import {transformSet} from './utils';
import {detect} from 'utils/network.js';

function getAppReducer() {
    return require('../reducers'); // eslint-disable-line global-require
}

const usersSetTransform = [
    'profilesInChannel',
    'profilesNotInChannel',
    'profilesInTeam',
    'profilesNotInTeam'
];

const teamSetTransform = [
    'membersInTeam'
];

const setTransforms = [
    ...usersSetTransform,
    ...teamSetTransform
];

export default function configureStore(initialState, persistorStorage = null) {
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
        }
    );

    const offlineOptions = {
        persist: (store, options) => {
            const localforage = extendPrototype(localForage);
            var storage = persistorStorage || localforage;
            const KEY_PREFIX = "reduxPersist:";
            const persistor = persistStore(store, {storage, keyPrefix: KEY_PREFIX, ...options}, () => {
                store.dispatch({
                    type: General.STORE_REHYDRATION_COMPLETE,
                    complete: true
                });
            });
            if (localforage === storage) {
                localforage.ready(() => {
                    localforage.configObservables({
                        crossTabNotification: true,
                    });
                    var observable = localforage.newObservable({
                        crossTabNotification: true,
                        changeDetection: true
                    });
                    var restoredState = {}
                    localforage.iterate((value, key) => {
                        if(key && key.indexOf(KEY_PREFIX+"storage:") === 0){
                            const keyspace = key.substr((KEY_PREFIX+"storage:").length);
                            restoredState[keyspace] = value;
                        }
                    }).then(() => {
                        storageRehydrate(restoredState)(store.dispatch);
                    });
                    observable.subscribe({
                        next: (args) => {
                            if(args.key && args.key.indexOf(KEY_PREFIX+"storage:") === 0 && args.oldValue === null){
                                const keyspace = args.key.substr((KEY_PREFIX+"storage:").length);

                                var statePartial = {};
                                statePartial[keyspace] = args.newValue;
                                storageRehydrate(statePartial)(store.dispatch, store.getState());
                            }
                        }
                    })
                })
            }
            let purging = false;

            // check to see if the logout request was successful
            store.subscribe(() => {
                const state = store.getState();
                if (state.requests.users.logout.status === RequestStatus.SUCCESS && !purging) {
                    purging = true;

                    persistor.purge();

                    document.cookie = 'MMUSERID=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    window.location.href = '/';

                    store.dispatch(batchActions([
                        {
                            type: General.OFFLINE_STORE_RESET,
                            data: Object.assign({}, reduxInitialState, initialState)
                        }
                    ]));

                    setTimeout(() => {
                        purging = false;
                    }, 500);
                }
            });

            return persistor;
        },
        persistOptions: {
            autoRehydrate: {
                log: false
            },
            blacklist: ['errors', 'offline', 'requests', 'entities', 'views', 'plugins'],
            debounce: 500,
            transforms: [
                setTransformer
            ],
            _stateIterator: (collection, callback) => {
                return Object.keys(collection).forEach((key) => {
                    if (key === 'storage') {
                        Object.keys(collection[key]).forEach((subkey) => {
                            callback(collection[key][subkey], key+":"+subkey)
                        })
                    } else {
                        callback(collection[key], key)
                    }
                });
            },
            _stateGetter: (state, key) => {
                if (key.indexOf('storage:') == 0) {
                    state.storage = state.storage || {};
                    return state.storage[key.substr(8)];
                }
                return state[key];
            },
            _stateSetter: (state, key, value) => {
                if (key.indexOf('storage:') == 0) {
                    state.storage = state.storage || {};
                    state.storage[key.substr(8)] = value;
                }
                state[key] = value;
                return state;
            }

        },
        detectNetwork: detect
    };

    return configureServiceStore({}, appReducer, offlineOptions, getAppReducer, {enableBuffer: false});
}
