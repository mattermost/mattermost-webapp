// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import storageReducer from 'reducers/storage';
import {StorageTypes} from 'utils/constants';

describe('Reducers.Storage', () => {
    const now = new Date();

    it('Storage.SET_ITEM', async () => {
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

    it('Storage.SET_GLOBAL_ITEM', async () => {
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

    it('Storage.REMOVE_ITEM', async () => {
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

    it('Storage.REMOVE_GLOBAL_ITEM', async () => {
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

    it('Storage.CLEAR', async () => {
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

    it('Storage.ACTION_ON_ITEMS_WITH_PREFIX', async () => {
        var touchedPairs = [];
        storageReducer(
            {
                storage: {
                    user_id_prefix_key1: {value: 1, timestamp: now},
                    user_id_prefix_key2: {value: 2, timestamp: now},
                    user_id_not_prefix_key: {value: 3, timestamp: now},
                },
            },
            {
                type: StorageTypes.ACTION_ON_ITEMS_WITH_PREFIX,
                data: {
                    globalPrefix: 'user_id_',
                    prefix: 'prefix',
                    action: (key, value) => touchedPairs.push([key, value]),
                },
            },
        );
        assert.deepEqual(
            touchedPairs,
            [['prefix_key1', 1], ['prefix_key2', 2]],
        );
    });

    it('Storage.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX', async () => {
        var touchedPairs = [];
        storageReducer(
            {
                storage: {
                    prefix_key1: {value: 1, timestamp: now},
                    prefix_key2: {value: 2, timestamp: now},
                    not_prefix_key: {value: 3, timestamp: now},
                },
            },
            {
                type: StorageTypes.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX,
                data: {
                    prefix: 'prefix',
                    action: (key, value) => touchedPairs.push([key, value]),
                },
            },
        );
        assert.deepEqual(
            touchedPairs,
            [['prefix_key1', 1], ['prefix_key2', 2]],
        );
    });

    it('Storage.STORAGE_REHYDRATE', async () => {
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
