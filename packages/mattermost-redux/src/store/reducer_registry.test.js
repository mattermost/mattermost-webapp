// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import reducerRegistry from 'mattermost-redux/store/reducer_registry';
import configureStore from 'mattermost-redux/test/test_store';

describe('ReducerRegistry', () => {
    let store;

    function testReducer() {
        return 'teststate';
    }

    beforeEach(() => {
        store = configureStore();
    });

    it('register reducer', () => {
        reducerRegistry.register('testReducer', testReducer);
        assert.equal(store.getState().testReducer, 'teststate');
    });

    it('get reducers', () => {
        reducerRegistry.register('testReducer', testReducer);
        const reducers = reducerRegistry.getReducers();
        assert.ok(reducers.testReducer);
        assert.ok(reducers.entities);
        assert.ok(reducers.requests);
        assert.ok(reducers.errors);
    });
});

