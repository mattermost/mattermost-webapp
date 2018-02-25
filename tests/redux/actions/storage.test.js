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
        assert.deepEqual(
            store.getState().storage.storage,
            {unknown_test: 'value'}
        );
    });

    it('removeItem', async () => {
        await Actions.setItem('test1', 'value1')(store.dispatch, store.getState);
        await Actions.setItem('test2', 'value2')(store.dispatch, store.getState);
        assert.deepEqual(
            store.getState().storage.storage,
            {
                unknown_test1: 'value1',
                unknown_test2: 'value2',
            }
        );
        await Actions.removeItem('test1')(store.dispatch, store.getState);
        assert.deepEqual(
            store.getState().storage.storage,
            {unknown_test2: 'value2'}
        );
    });

    it('setGlobalItem', async () => {
        await Actions.setGlobalItem('test', 'value')(store.dispatch, store.getState);
        assert.deepEqual(
            store.getState().storage.storage,
            {test: 'value'}
        );
    });

    it('removeGlobalItem', async () => {
        await Actions.setGlobalItem('test1', 'value1')(store.dispatch, store.getState);
        await Actions.setGlobalItem('test2', 'value2')(store.dispatch, store.getState);
        assert.deepEqual(
            store.getState().storage.storage,
            {
                test1: 'value1',
                test2: 'value2',
            }
        );
        await Actions.removeGlobalItem('test1')(store.dispatch, store.getState);
        assert.deepEqual(
            store.getState().storage.storage,
            {test2: 'value2'}
        );
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
        assert.deepEqual(
            store.getState().storage.storage,
            {excluded: 'not-cleared'}
        );
    });

    it('rehydrate', async () => {
        const persistor = {
            pause: jest.fn(),
            resume: jest.fn(),
        };
        await Actions.storageRehydrate({test: '123'})(store.dispatch, persistor);
        assert.deepEqual(
            store.getState().storage.storage,
            {test: '123'}
        );
        await Actions.storageRehydrate({test: '456'})(store.dispatch, persistor);
        assert.deepEqual(
            store.getState().storage.storage,
            {test: '456'}
        );
        await Actions.storageRehydrate({test2: '789'})(store.dispatch, persistor);
        assert.deepEqual(
            store.getState().storage.storage,
            {test: '456', test2: '789'}
        );
    });
});
