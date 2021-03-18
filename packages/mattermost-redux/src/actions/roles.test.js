// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';
import nock from 'nock';

import * as Actions from 'mattermost-redux/actions/roles';
import {Client4} from 'mattermost-redux/client';
import {RequestStatus} from '../constants';

import TestHelper from 'mattermost-redux/test/test_helper';
import configureStore from 'mattermost-redux/test/test_store';

describe('Actions.Roles', () => {
    let store;

    beforeAll(() => {
        TestHelper.initBasic(Client4);
    });

    beforeEach(() => {
        store = configureStore();
    });

    afterAll(() => {
        TestHelper.tearDown();
    });

    it('getRolesByNames', async () => {
        nock(Client4.getRolesRoute()).
            post('/names').
            reply(200, [TestHelper.basicRoles.system_admin]);
        await Actions.getRolesByNames(['system_admin'])(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.roles.getRolesByNames;
        const {roles} = state.entities.roles;

        if (request.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(request.error));
        }

        assert.equal(roles.system_admin.name, 'system_admin');
        assert.deepEqual(roles.system_admin.permissions, TestHelper.basicRoles.system_admin.permissions);
    });

    it('getRoleByName', async () => {
        nock(Client4.getRolesRoute()).
            get('/name/system_admin').
            reply(200, TestHelper.basicRoles.system_admin);
        await Actions.getRoleByName('system_admin')(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.roles.getRolesByNames;
        const {roles} = state.entities.roles;

        if (request.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(request.error));
        }

        assert.equal(roles.system_admin.name, 'system_admin');
        assert.deepEqual(roles.system_admin.permissions, TestHelper.basicRoles.system_admin.permissions);
    });

    it('getRole', async () => {
        nock(Client4.getRolesRoute()).
            get('/' + TestHelper.basicRoles.system_admin.id).
            reply(200, TestHelper.basicRoles.system_admin);

        await Actions.getRole(TestHelper.basicRoles.system_admin.id)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.roles.getRole;
        const {roles} = state.entities.roles;

        if (request.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(request.error));
        }

        assert.equal(roles.system_admin.name, 'system_admin');
        assert.deepEqual(roles.system_admin.permissions, TestHelper.basicRoles.system_admin.permissions);
    });

    it('loadRolesIfNeeded', async () => {
        const mock1 = nock(Client4.getRolesRoute()).
            post('/names', JSON.stringify(['test'])).
            reply(200, []);
        const mock2 = nock(Client4.getRolesRoute()).
            post('/names', JSON.stringify(['test2'])).
            reply(200, []);
        const fakeState = {
            entities: {
                general: {
                    serverVersion: '4.3',
                },
                roles: {
                    roles: {
                        test: {},
                    },
                },
            },
        };
        await Actions.loadRolesIfNeeded(['test'])(store.dispatch, () => fakeState);
        assert(!mock1.isDone());
        assert(!mock2.isDone());

        fakeState.entities.roles.pending = new Set();
        fakeState.entities.general.serverVersion = '4.3';
        await Actions.loadRolesIfNeeded(['test', 'test2'])(store.dispatch, () => fakeState);
        assert(!mock1.isDone());
        assert(!mock2.isDone());

        fakeState.entities.roles.pending = new Set();
        fakeState.entities.general.serverVersion = null;
        await Actions.loadRolesIfNeeded(['test', 'test2'])(store.dispatch, () => fakeState);
        assert(!mock1.isDone());
        assert(!mock2.isDone());

        fakeState.entities.roles.pending = new Set();
        fakeState.entities.general.serverVersion = '4.9';
        await Actions.loadRolesIfNeeded(['test', 'test2', ''])(store.dispatch, () => fakeState);
        assert(!mock1.isDone());
        assert(mock2.isDone());
    });

    it('editRole', async () => {
        const roleId = TestHelper.basicRoles.system_admin.id;
        const mock = nock(Client4.getRolesRoute()).
            put('/' + roleId + '/patch', JSON.stringify({id: roleId, test: 'test'})).
            reply(200, {});

        await Actions.editRole({id: roleId, test: 'test'})(store.dispatch, store.state);
        assert(mock.isDone());
    });
});
