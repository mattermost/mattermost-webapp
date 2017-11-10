// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {batchActions} from 'redux-batched-actions';
import {createTransform, persistStore} from 'redux-persist';

import localForage from "localforage";
import { extendPrototype } from "localforage-observable";

import {General, RequestStatus} from 'mattermost-redux/constants';
import configureServiceStore from 'mattermost-redux/store';
import reduxInitialState from 'mattermost-redux/store/initial_state';

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
                    observable.subscribe({
                        next: (args) => {
                            if(args.key && args.key.indexOf(KEY_PREFIX) === 0){
                                const keyspace = args.key.substr(KEY_PREFIX.length);

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
            ]
        },
        detectNetwork: detect
    };

    return configureServiceStore({}, appReducer, offlineOptions, getAppReducer, {enableBuffer: false});
}
