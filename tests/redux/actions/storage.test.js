// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import assert from 'assert';

import * as Actions from 'actions/storage';
import configureStore from 'store';

describe('Actions.Storage', () => {
    let store;
    beforeEach(async () => {
        store = await configureStore();
    });

    it('setItem', async () => {
        await Actions.setItem('test', 'value')(store.dispatch, store.getState);
        assert.equal(store.getState().storage.storage.unknown_test.value, 'value');
        assert.notEqual(typeof store.getState().storage.storage.unknown_test.timestamp, 'undefined');
    });

    it('removeItem', async () => {
        await Actions.setItem('test1', 'value1')(store.dispatch, store.getState);
        await Actions.setItem('test2', 'value2')(store.dispatch, store.getState);
        assert.equal(store.getState().storage.storage.unknown_test1.value, 'value1');
        assert.equal(store.getState().storage.storage.unknown_test2.value, 'value2');
        await Actions.removeItem('test1')(store.dispatch, store.getState);
        assert.equal(typeof store.getState().storage.storage.unknown_test1, 'undefined');
        assert.equal(store.getState().storage.storage.unknown_test2.value, 'value2');
    });

    it('setGlobalItem', async () => {
        await Actions.setGlobalItem('test', 'value')(store.dispatch, store.getState);
        assert.equal(store.getState().storage.storage.test.value, 'value');
        assert.notEqual(typeof store.getState().storage.storage.test.timestamp, 'undefined');
    });

    it('removeGlobalItem', async () => {
        await Actions.setGlobalItem('test1', 'value1')(store.dispatch, store.getState);
        await Actions.setGlobalItem('test2', 'value2')(store.dispatch, store.getState);
        assert.equal(store.getState().storage.storage.test1.value, 'value1');
        assert.equal(store.getState().storage.storage.test2.value, 'value2');
        await Actions.removeGlobalItem('test1')(store.dispatch, store.getState);
        assert.equal(typeof store.getState().storage.storage.test1, 'undefined');
        assert.equal(store.getState().storage.storage.test2.value, 'value2');
    });

    it('actionOnGlobalItemsWithPrefix', async () => {
        var touchedPairs = [];

        await Actions.setGlobalItem('prefix_test1', 1)(store.dispatch, store.getState);
        await Actions.setGlobalItem('prefix_test2', 2)(store.dispatch, store.getState);
        await Actions.setGlobalItem('not_prefix_test', 3)(store.dispatch, store.getState);
        await Actions.actionOnGlobalItemsWithPrefix(
            'prefix',
            (key, value) => touchedPairs.push([key, value])
        )(store.dispatch, store.getState);
        assert.deepEqual(
            touchedPairs,
            [['prefix_test1', 1], ['prefix_test2', 2]]
        );
    });

    it('actionOnItemsWithPrefix', async () => {
        var touchedPairs = [];
        await Actions.setItem('prefix_test1', 1)(store.dispatch, store.getState);
        await Actions.setItem('prefix_test2', 2)(store.dispatch, store.getState);
        await Actions.setItem('not_prefix_test', 3)(store.dispatch, store.getState);
        await Actions.actionOnItemsWithPrefix(
            'prefix',
            (key, value) => touchedPairs.push([key, value])
        )(store.dispatch, store.getState);
        assert.deepEqual(
            touchedPairs,
            [['prefix_test1', 1], ['prefix_test2', 2]]
        );
    });

    it('clear', async () => {
        await Actions.setGlobalItem('key', 'value')(store.dispatch, store.getState);
        await Actions.setGlobalItem('excluded', 'not-cleared')(store.dispatch, store.getState);
        await Actions.clear({exclude: ['excluded']})(store.dispatch, store.getState);
        assert.equal(store.getState().storage.storage.excluded.value, 'not-cleared');
        assert.equal(typeof store.getState().storage.storage.key, 'undefined');
    });

    it('rehydrate', async () => {
        const RealDate = Date;
        const now = new Date(1487076708000);
        global.Date = class extends RealDate {
            constructor() {
                super();
                return new RealDate(now);
            }
        };

        const persistor = {
            pause: jest.fn(),
            resume: jest.fn(),
        };
        await Actions.storageRehydrate({test: '123'}, persistor)(store.dispatch, store.getState);
        assert.equal(store.getState().storage.storage.test.value, '123');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), now.valueOf());
        await Actions.storageRehydrate({test: '456'}, persistor)(store.dispatch, store.getState);
        assert.equal(store.getState().storage.storage.test.value, '456');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), now.valueOf());
        await Actions.storageRehydrate({test2: '789'}, persistor)(store.dispatch, store.getState);
        assert.equal(store.getState().storage.storage.test.value, '456');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), now.valueOf());
        assert.equal(store.getState().storage.storage.test2.value, '789');
        assert.equal(store.getState().storage.storage.test2.timestamp.valueOf(), now.valueOf());
        global.Date = RealDate;
    });

    it('rehydrate-with-timestamp', async () => {
        const now = new Date();
        const persistor = {
            pause: jest.fn(),
            resume: jest.fn(),
        };
        await Actions.storageRehydrate({test: JSON.stringify({value: '123', timestamp: now})}, persistor)(store.dispatch, store.getState);
        assert.equal(store.getState().storage.storage.test.value, '123');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), now.valueOf());

        const older = new Date(now);
        older.setSeconds(now.getSeconds() - 2);
        await Actions.storageRehydrate({test: JSON.stringify({value: '456', timestamp: older})}, persistor)(store.dispatch, store.getState);
        assert.equal(store.getState().storage.storage.test.value, '123');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), now.valueOf());

        const newer = new Date(now);
        newer.setSeconds(now.getSeconds() + 2);
        await Actions.storageRehydrate({test: JSON.stringify({value: '456', timestamp: newer})}, persistor)(store.dispatch, store.getState);
        assert.equal(store.getState().storage.storage.test.value, '456');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), newer.valueOf());

        const newest = new Date(now);
        newest.setSeconds(now.getSeconds() + 10);
        await Actions.storageRehydrate({test2: JSON.stringify({value: '789', timestamp: newest})}, persistor)(store.dispatch, store.getState);
        assert.equal(store.getState().storage.storage.test.value, '456');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), newer.valueOf());
        assert.equal(store.getState().storage.storage.test2.value, '789');
        assert.equal(store.getState().storage.storage.test2.timestamp.valueOf(), newest.valueOf());
    });
});
