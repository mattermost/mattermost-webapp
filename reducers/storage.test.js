// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import storageReducer from 'reducers/storage';
import {StorageTypes} from 'utils/constants';

describe('Reducers.Storage', () => {
    const now = new Date();

    it('Storage.SET_ITEM', () => {
        const nextState = storageReducer(
            {
                storage: {},
            },
            {
                type: StorageTypes.SET_ITEM,
                data: {
                    name: 'key',
                    prefix: 'user_id_',
                    value: 'value',
                    timestamp: now,
                },
            },
        );
        assert.deepEqual(
            nextState.storage,
            {
                user_id_key: {value: 'value', timestamp: now},
            },
        );
    });

    it('Storage.SET_GLOBAL_ITEM', () => {
        const nextState = storageReducer(
            {
                storage: {},
            },
            {
                type: StorageTypes.SET_GLOBAL_ITEM,
                data: {
                    name: 'key',
                    value: 'value',
                    timestamp: now,
                },
            },
        );
        assert.deepEqual(
            nextState.storage,
            {
                key: {value: 'value', timestamp: now},
            },
        );
    });

    it('Storage.REMOVE_ITEM', () => {
        var nextState = storageReducer(
            {
                storage: {
                    user_id_key: 'value',
                },
            },
            {
                type: StorageTypes.REMOVE_ITEM,
                data: {
                    name: 'key',
                    prefix: 'user_id_',
                },
            },
        );
        assert.deepEqual(
            nextState.storage,
            {},
        );
        nextState = storageReducer(
            {
                storage: {},
            },
            {
                type: StorageTypes.REMOVE_ITEM,
                data: {
                    name: 'key',
                    prefix: 'user_id_',
                },
            },
        );
        assert.deepEqual(
            nextState.storage,
            {},
        );
    });

    it('Storage.REMOVE_GLOBAL_ITEM', () => {
        var nextState = storageReducer(
            {
                storage: {
                    key: 'value',
                },
            },
            {
                type: StorageTypes.REMOVE_GLOBAL_ITEM,
                data: {
                    name: 'key',
                },
            },
        );
        assert.deepEqual(
            nextState.storage,
            {},
        );
        nextState = storageReducer(
            {
                storage: {},
            },
            {
                type: StorageTypes.REMOVE_GLOBAL_ITEM,
                data: {
                    name: 'key',
                },
            },
        );
        assert.deepEqual(
            nextState.storage,
            {},
        );
    });

    it('Storage.CLEAR', () => {
        const nextState = storageReducer(
            {
                storage: {
                    key: {value: 'value', timestamp: now},
                    excluded: {value: 'not-cleared', timestamp: now},
                },
            },
            {
                type: StorageTypes.CLEAR,
                data: {
                    exclude: ['excluded'],
                },
            },
        );
        assert.deepEqual(
            nextState.storage,
            {
                excluded: {value: 'not-cleared', timestamp: now},
            },
        );
    });

    describe('Storage.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX', () => {
        it('should call the provided action on the given objects', () => {
            const state = storageReducer({
                storage: {
                    prefix_key1: {value: 1, timestamp: now},
                    prefix_key2: {value: 2, timestamp: now},
                    not_prefix_key: {value: 3, timestamp: now},
                },
            }, {});

            const nextState = storageReducer(state, {
                type: StorageTypes.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX,
                data: {
                    prefix: 'prefix',
                    action: (key, value) => value + 5,
                },
            });

            expect(nextState).not.toBe(state);
            expect(nextState.storage.prefix_key1.value).toBe(6);
            expect(nextState.storage.prefix_key1.timestamp).not.toBe(now);
            expect(nextState.storage.prefix_key2.value).toBe(7);
            expect(nextState.storage.prefix_key2.timestamp).not.toBe(now);
            expect(nextState.storage.prefix_key3).toBe(state.storage.prefix_key3);
        });

        it('should return the original state if no results change', () => {
            const state = storageReducer({
                storage: {
                    prefix_key1: {value: 1, timestamp: now},
                    prefix_key2: {value: 2, timestamp: now},
                    not_prefix_key: {value: 3, timestamp: now},
                },
            }, {});

            const nextState = storageReducer(state, {
                type: StorageTypes.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX,
                data: {
                    prefix: 'prefix',
                    action: (key, value) => value,
                },
            });

            expect(nextState).toBe(state);
        });
    });

    it('Storage.STORAGE_REHYDRATE', () => {
        var nextState = storageReducer(
            {
                storage: {},
            },
            {
                type: StorageTypes.STORAGE_REHYDRATE,
                data: {test: '123'},
            },
        );
        assert.deepEqual(
            nextState.storage,
            {test: '123'},
        );
        nextState = storageReducer(
            nextState,
            {
                type: StorageTypes.STORAGE_REHYDRATE,
                data: {test: '456'},
            },
        );
        assert.deepEqual(
            nextState.storage,
            {test: '456'},
        );
        nextState = storageReducer(
            nextState,
            {
                type: StorageTypes.STORAGE_REHYDRATE,
                data: {test2: '789'},
            },
        );
        assert.deepEqual(
            nextState.storage,
            {test: '456', test2: '789'},
        );
    });
});
