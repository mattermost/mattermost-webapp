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
});
