// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as Actions from 'actions/admin_actions.jsx';
import configureStore from 'store';

describe('Actions.Admin', () => {
    let store;
    beforeEach(async () => {
        store = await configureStore();
    });

    test('Register a plugin adds the plugin to the state', async () => {
        const func = jest.fn();
        expect(store.getState().plugins.adminConsoleReducers).toEqual({});
        store.dispatch(Actions.registerAdminConsolePlugin('plugin-id', func));
        expect(store.getState().plugins.adminConsoleReducers).toEqual({'plugin-id': func});
    });

    test('Unregister a plugin removes an existing plugin from the state', async () => {
        const func = jest.fn();
        expect(store.getState().plugins.adminConsoleReducers).toEqual({});
        store.dispatch(Actions.registerAdminConsolePlugin('plugin-id', func));
        expect(store.getState().plugins.adminConsoleReducers).toEqual({'plugin-id': func});

        store.dispatch(Actions.unregisterAdminConsolePlugin('plugin-id'));
        expect(store.getState().plugins.adminConsoleReducers).toEqual({});
    });

    test('Unregister an unexisting plugin do nothing', async () => {
        const func = jest.fn();
        expect(store.getState().plugins.adminConsoleReducers).toEqual({});
        store.dispatch(Actions.registerAdminConsolePlugin('plugin-id', func));
        expect(store.getState().plugins.adminConsoleReducers).toEqual({'plugin-id': func});

        store.dispatch(Actions.unregisterAdminConsolePlugin('invalid-plugin-id'));
        expect(store.getState().plugins.adminConsoleReducers).toEqual({'plugin-id': func});
    });
});
