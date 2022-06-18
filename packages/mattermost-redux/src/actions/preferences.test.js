// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import nock from 'nock';

import * as Actions from 'mattermost-redux/actions/preferences';
import {loadMeREST} from 'mattermost-redux/actions/users';
import {UserTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';

import TestHelper from 'mattermost-redux/test/test_helper';
import configureStore from 'mattermost-redux/test/test_store';

const OK_RESPONSE = {status: 'OK'};

describe('Actions.Preferences', () => {
    let store;
    beforeAll(() => {
        TestHelper.initBasic(Client4);
    });

    beforeEach(() => {
        store = configureStore({
            entities: {
                users: {
                    currentUserId: TestHelper.basicUser.id,
                },
                general: {
                    config: {
                        FeatureFlagCollapsedThreads: 'true',
                        CollapsedThreads: 'always_on',
                    },
                },
            },
        });
    });

    afterAll(() => {
        TestHelper.tearDown();
    });

    it('getMyPreferences', async () => {
        const user = TestHelper.basicUser;
        const existingPreferences = [
            {
                user_id: user.id,
                category: 'test',
                name: 'test1',
                value: 'test',
            },
            {
                user_id: user.id,
                category: 'test',
                name: 'test2',
                value: 'test',
            },
        ];

        nock(Client4.getUsersRoute()).
            put(`/${TestHelper.basicUser.id}/preferences`).
            reply(200, OK_RESPONSE);
        await Client4.savePreferences(user.id, existingPreferences);

        nock(Client4.getUsersRoute()).
            get('/me/preferences').
            reply(200, existingPreferences);
        await Actions.getMyPreferences()(store.dispatch, store.getState);

        const state = store.getState();
        const {myPreferences} = state.entities.preferences;

        assert.ok(myPreferences['test--test1'], 'first preference doesn\'t exist');
        assert.deepEqual(existingPreferences[0], myPreferences['test--test1']);
        assert.ok(myPreferences['test--test2'], 'second preference doesn\'t exist');
        assert.deepEqual(existingPreferences[1], myPreferences['test--test2']);
    });

    it('savePrefrences', async () => {
        const user = TestHelper.basicUser;
        const existingPreferences = [
            {
                user_id: user.id,
                category: 'test',
                name: 'test1',
                value: 'test',
            },
        ];

        nock(Client4.getUsersRoute()).
            put(`/${TestHelper.basicUser.id}/preferences`).
            reply(200, OK_RESPONSE);
        await Client4.savePreferences(user.id, existingPreferences);

        nock(Client4.getUsersRoute()).
            get('/me/preferences').
            reply(200, existingPreferences);
        await Actions.getMyPreferences()(store.dispatch, store.getState);

        const preferences = [
            {
                user_id: user.id,
                category: 'test',
                name: 'test2',
                value: 'test',
            },
            {
                user_id: user.id,
                category: 'test',
                name: 'test3',
                value: 'test',
            },
        ];

        nock(Client4.getUsersRoute()).
            put(`/${TestHelper.basicUser.id}/preferences`).
            reply(200, OK_RESPONSE);
        await Actions.savePreferences(user.id, preferences)(store.dispatch, store.getState);

        const state = store.getState();
        const {myPreferences} = state.entities.preferences;

        assert.ok(myPreferences['test--test1'], 'first preference doesn\'t exist');
        assert.deepEqual(existingPreferences[0], myPreferences['test--test1']);
        assert.ok(myPreferences['test--test2'], 'second preference doesn\'t exist');
        assert.deepEqual(preferences[0], myPreferences['test--test2']);
        assert.ok(myPreferences['test--test3'], 'third preference doesn\'t exist');
        assert.deepEqual(preferences[1], myPreferences['test--test3']);
    });

    it('deletePreferences', async () => {
        const user = TestHelper.basicUser;
        const existingPreferences = [
            {
                user_id: user.id,
                category: 'test',
                name: 'test1',
                value: 'test',
            },
            {
                user_id: user.id,
                category: 'test',
                name: 'test2',
                value: 'test',
            },
            {
                user_id: user.id,
                category: 'test',
                name: 'test3',
                value: 'test',
            },
        ];

        nock(Client4.getUsersRoute()).
            put(`/${TestHelper.basicUser.id}/preferences`).
            reply(200, OK_RESPONSE);
        await Client4.savePreferences(user.id, existingPreferences);

        nock(Client4.getUsersRoute()).
            get('/me/preferences').
            reply(200, existingPreferences);
        await Actions.getMyPreferences()(store.dispatch, store.getState);

        nock(Client4.getUsersRoute()).
            post(`/${TestHelper.basicUser.id}/preferences/delete`).
            reply(200, OK_RESPONSE);
        await Actions.deletePreferences(user.id, [
            existingPreferences[0],
            existingPreferences[2],
        ])(store.dispatch, store.getState);

        const state = store.getState();
        const {myPreferences} = state.entities.preferences;

        assert.ok(!myPreferences['test--test1'], 'deleted preference still exists');
        assert.ok(myPreferences['test--test2'], 'second preference doesn\'t exist');
        assert.deepEqual(existingPreferences[1], myPreferences['test--test2']);
        assert.ok(!myPreferences['test--test3'], 'third preference doesn\'t exist');
    });

    it('saveTheme', async () => {
        const user = TestHelper.basicUser;
        const team = TestHelper.basicTeam;
        const existingPreferences = [
            {
                user_id: user.id,
                category: 'theme',
                name: team.id,
                value: JSON.stringify({
                    type: 'Mattermost',
                }),
            },
        ];

        nock(Client4.getUsersRoute()).
            get('/me/preferences').
            reply(200, existingPreferences);
        await Actions.getMyPreferences()(store.dispatch, store.getState);

        const newTheme = {
            type: 'Mattermost Dark',
        };
        nock(Client4.getUsersRoute()).
            put(`/${TestHelper.basicUser.id}/preferences`).
            reply(200, OK_RESPONSE);
        await Actions.saveTheme(team.id, newTheme)(store.dispatch, store.getState);

        const state = store.getState();
        const {myPreferences} = state.entities.preferences;

        assert.ok(myPreferences[`theme--${team.id}`], 'theme preference doesn\'t exist');
        assert.deepEqual(myPreferences[`theme--${team.id}`].value, JSON.stringify(newTheme));
    });

    it('deleteTeamSpecificThemes', async () => {
        const user = TestHelper.basicUser;
        TestHelper.mockLogin();
        store.dispatch({
            type: UserTypes.LOGIN_SUCCESS,
        });
        await loadMeREST()(store.dispatch, store.getState);

        const theme = {
            type: 'Mattermost Dark',
        };
        const existingPreferences = [
            {
                user_id: user.id,
                category: 'theme',
                name: '',
                value: JSON.stringify(theme),
            },
            {
                user_id: user.id,
                category: 'theme',
                name: TestHelper.generateId(),
                value: JSON.stringify({
                    type: 'Mattermost',
                }),
            },
            {
                user_id: user.id,
                category: 'theme',
                name: TestHelper.generateId(),
                value: JSON.stringify({
                    type: 'Mattermost',
                }),
            },
        ];

        nock(Client4.getUsersRoute()).
            put(`/${user.id}/preferences`).
            reply(200, OK_RESPONSE);
        await Client4.savePreferences(user.id, existingPreferences);

        nock(Client4.getUsersRoute()).
            get('/me/preferences').
            reply(200, existingPreferences);
        await Actions.getMyPreferences()(store.dispatch, store.getState);

        nock(Client4.getUsersRoute()).
            post(`/${user.id}/preferences/delete`).
            reply(200, OK_RESPONSE);
        await Actions.deleteTeamSpecificThemes()(store.dispatch, store.getState);

        const state = store.getState();
        const {myPreferences} = state.entities.preferences;

        assert.equal(Object.entries(myPreferences).length, 1);
        assert.ok(myPreferences['theme--'], 'theme preference doesn\'t exist');
    });
});
