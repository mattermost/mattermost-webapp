// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import assert from 'assert';

import storageReducer from 'reducers/storage';
import {StorageTypes} from 'utils/constants';

describe('Reducers.Storage', () => {
    it('Storage.SET_ITEM', async () => {
        const nextState = storageReducer(
            {},
            {
                type: StorageTypes.SET_ITEM,
                data: {
                    name: 'key',
                    prefix: 'user_id_',
                    value: 'value'
                }
            }
        );
        assert.deepEqual(
            nextState,
            {
                user_id_key: 'value'
            }
        );
    });

    it('Storage.SET_GLOBAL_ITEM', async () => {
        const nextState = storageReducer(
            {},
            {
                type: StorageTypes.SET_GLOBAL_ITEM,
                data: {
                    name: 'key',
                    value: 'value'
                }
            }
        );
        assert.deepEqual(
            nextState,
            {
                key: 'value'
            }
        );
    });

    it('Storage.REMOVE_ITEM', async () => {
        var nextState = storageReducer(
            {
                user_id_key: 'value'
            },
            {
                type: StorageTypes.REMOVE_ITEM,
                data: {
                    name: 'key',
                    prefix: 'user_id_'
                }
            }
        );
        assert.deepEqual(
            nextState,
            {}
        );
        nextState = storageReducer(
            {},
            {
                type: StorageTypes.REMOVE_ITEM,
                data: {
                    name: 'key',
                    prefix: 'user_id_'
                }
            }
        );
        assert.deepEqual(
            nextState,
            {}
        );
    });

    it('Storage.REMOVE_GLOBAL_ITEM', async () => {
        var nextState = storageReducer(
            {
                key: 'value'
            },
            {
                type: StorageTypes.REMOVE_GLOBAL_ITEM,
                data: {
                    name: 'key'
                }
            }
        );
        assert.deepEqual(
            nextState,
            {}
        );
        nextState = storageReducer(
            {},
            {
                type: StorageTypes.REMOVE_GLOBAL_ITEM,
                data: {
                    name: 'key'
                }
            }
        );
        assert.deepEqual(
            nextState,
            {}
        );
    });

    it('Storage.CLEAR', async () => {
        const nextState = storageReducer(
            {
                key: 'value',
                excluded: 'not-cleared'
            },
            {
                type: StorageTypes.CLEAR,
                data: {
                    exclude: ['excluded']
                }
            }
        );
        assert.deepEqual(
            nextState,
            {
                excluded: 'not-cleared'
            }
        );
    });

    it('Storage.ACTION_ON_ITEMS_WITH_PREFIX', async () => {
        var touchedPairs = [];
        storageReducer(
            {
                user_id_prefix_key1: 1,
                user_id_prefix_key2: 2,
                user_id_not_prefix_key: 3
            },
            {
                type: StorageTypes.ACTION_ON_ITEMS_WITH_PREFIX,
                data: {
                    globalPrefix: 'user_id_',
                    prefix: 'prefix',
                    action: (key, value) => touchedPairs.push([key, value])
                }
            }
        );
        assert.deepEqual(
            touchedPairs,
            [['prefix_key1', 1], ['prefix_key2', 2]]
        );
    });

    it('Storage.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX', async () => {
        var touchedPairs = [];
        storageReducer(
            {
                prefix_key1: 1,
                prefix_key2: 2,
                not_prefix_key: 3
            },
            {
                type: StorageTypes.ACTION_ON_GLOBAL_ITEMS_WITH_PREFIX,
                data: {
                    prefix: 'prefix',
                    action: (key, value) => touchedPairs.push([key, value])
                }
            }
        );
        assert.deepEqual(
            touchedPairs,
            [['prefix_key1', 1], ['prefix_key2', 2]]
        );
    });

    it('Storage.STORAGE_REHYDRATE', async () => {
        var nextState = storageReducer(
            {},
            {
                type: StorageTypes.STORAGE_REHYDRATE,
                data: {test: '123'}
            }
        );
        assert.deepEqual(
            nextState,
            {test: '123'}
        );
        nextState = storageReducer(
            nextState,
            {
                type: StorageTypes.STORAGE_REHYDRATE,
                data: {test: '456'}
            }
        );
        assert.deepEqual(
            nextState,
            {test: '456'}
        );
        nextState = storageReducer(
            nextState,
            {
                type: StorageTypes.STORAGE_REHYDRATE,
                data: {test2: '789'}
            }
        );
        assert.deepEqual(
            nextState,
            {test: '456', test2: '789'}
        );
    });
});
