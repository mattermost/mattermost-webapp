// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import * as Actions from 'actions/storage';
import configureStore from 'store';

describe('Actions.Storage', () => {
    let store;
    beforeEach(async () => {
        store = await configureStore();
    });

    it('setItem', async () => {
        store.dispatch(Actions.setItem('test', 'value'));

        assert.equal(store.getState().storage.storage.unknown_test.value, 'value');
        assert.notEqual(typeof store.getState().storage.storage.unknown_test.timestamp, 'undefined');
    });

    it('removeItem', async () => {
        store.dispatch(Actions.setItem('test1', 'value1'));
        store.dispatch(Actions.setItem('test2', 'value2'));

        assert.equal(store.getState().storage.storage.unknown_test1.value, 'value1');
        assert.equal(store.getState().storage.storage.unknown_test2.value, 'value2');

        store.dispatch(Actions.removeItem('test1'));

        assert.equal(typeof store.getState().storage.storage.unknown_test1, 'undefined');
        assert.equal(store.getState().storage.storage.unknown_test2.value, 'value2');
    });

    it('setGlobalItem', async () => {
        store.dispatch(Actions.setGlobalItem('test', 'value'));

        assert.equal(store.getState().storage.storage.test.value, 'value');
        assert.notEqual(typeof store.getState().storage.storage.test.timestamp, 'undefined');
    });

    it('removeGlobalItem', async () => {
        store.dispatch(Actions.setGlobalItem('test1', 'value1'));
        store.dispatch(Actions.setGlobalItem('test2', 'value2'));

        assert.equal(store.getState().storage.storage.test1.value, 'value1');
        assert.equal(store.getState().storage.storage.test2.value, 'value2');

        store.dispatch(Actions.removeGlobalItem('test1'));

        assert.equal(typeof store.getState().storage.storage.test1, 'undefined');
        assert.equal(store.getState().storage.storage.test2.value, 'value2');
    });

    it('actionOnGlobalItemsWithPrefix', async () => {
        var touchedPairs = [];

        store.dispatch(Actions.setGlobalItem('prefix_test1', 1));
        store.dispatch(Actions.setGlobalItem('prefix_test2', 2));
        store.dispatch(Actions.setGlobalItem('not_prefix_test', 3));

        store.dispatch(Actions.actionOnGlobalItemsWithPrefix(
            'prefix',
            (key, value) => touchedPairs.push([key, value]),
        ));

        assert.deepEqual(
            touchedPairs,
            [['prefix_test1', 1], ['prefix_test2', 2]],
        );
    });

    it('actionOnItemsWithPrefix', async () => {
        store.dispatch(Actions.setItem('prefix_test1', 1));
        store.dispatch(Actions.setItem('prefix_test2', 2));
        store.dispatch(Actions.setItem('not_prefix_test', 3));

        const touchedPairs = [];
        store.dispatch(Actions.actionOnItemsWithPrefix(
            'prefix',
            (key, value) => touchedPairs.push([key, value]),
        ));

        assert.deepEqual(
            touchedPairs,
            [['prefix_test1', 1], ['prefix_test2', 2]],
        );
    });

    it('clear', async () => {
        store.dispatch(Actions.setGlobalItem('key', 'value'));
        store.dispatch(Actions.setGlobalItem('excluded', 'not-cleared'));

        store.dispatch(Actions.clear({exclude: ['excluded']}));

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

        store.dispatch(Actions.storageRehydrate({test: '123'}, persistor));

        assert.equal(store.getState().storage.storage.test.value, '123');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), now.valueOf());

        store.dispatch(Actions.storageRehydrate({test: '456'}, persistor));

        assert.equal(store.getState().storage.storage.test.value, '456');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), now.valueOf());

        store.dispatch(Actions.storageRehydrate({test2: '789'}, persistor));

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

        store.dispatch(Actions.storageRehydrate({test: JSON.stringify({value: '123', timestamp: now})}, persistor));

        assert.equal(store.getState().storage.storage.test.value, '123');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), now.valueOf());

        const older = new Date(now);
        older.setSeconds(now.getSeconds() - 2);

        store.dispatch(Actions.storageRehydrate({test: JSON.stringify({value: '456', timestamp: older})}, persistor));

        assert.equal(store.getState().storage.storage.test.value, '123');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), now.valueOf());

        const newer = new Date(now);
        newer.setSeconds(now.getSeconds() + 2);

        store.dispatch(Actions.storageRehydrate({test: JSON.stringify({value: '456', timestamp: newer})}, persistor));

        assert.equal(store.getState().storage.storage.test.value, '456');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), newer.valueOf());

        const newest = new Date(now);
        newest.setSeconds(now.getSeconds() + 10);

        store.dispatch(Actions.storageRehydrate({test2: JSON.stringify({value: '789', timestamp: newest})}, persistor));

        assert.equal(store.getState().storage.storage.test.value, '456');
        assert.equal(store.getState().storage.storage.test.timestamp.valueOf(), newer.valueOf());
        assert.equal(store.getState().storage.storage.test2.value, '789');
        assert.equal(store.getState().storage.storage.test2.timestamp.valueOf(), newest.valueOf());
    });
});
