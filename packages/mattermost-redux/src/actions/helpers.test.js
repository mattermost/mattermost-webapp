// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {ClientError} from '@mattermost/client';

import {UserTypes} from 'mattermost-redux/action_types';
import {forceLogoutIfNecessary} from 'mattermost-redux/actions/helpers';
import {Client4} from 'mattermost-redux/client';
import configureStore, {mockDispatch} from 'mattermost-redux/test/test_store';

describe('Actions.Helpers', () => {
    describe('forceLogoutIfNecessary', () => {
        const token = 'token';

        beforeEach(() => {
            Client4.setToken(token);
        });

        it('should do nothing when passed a client error', async () => {
            const store = configureStore({
                entities: {
                    users: {
                        currentUserId: 'user',
                    },
                },
            });
            const dispatch = mockDispatch(store.dispatch);

            const error = new ClientError(Client4.getUrl(), {
                message: 'no internet connection',
                url: '/api/v4/foo/bar',
            });

            forceLogoutIfNecessary(error, dispatch, store.getState);

            assert.equal(Client4.token, token);
            assert.deepEqual(dispatch.actions, []);
        });

        it('should do nothing when passed a non-401 server error', async () => {
            const store = configureStore({
                entities: {
                    users: {
                        currentUserId: 'user',
                    },
                },
            });
            const dispatch = mockDispatch(store.dispatch);

            const error = new ClientError(Client4.getUrl(), {
                message: 'Failed to do something',
                status_code: 403,
                url: '/api/v4/foo/bar',
            });

            forceLogoutIfNecessary(error, dispatch, store.getState);

            assert.equal(Client4.token, token);
            assert.deepEqual(dispatch.actions, []);
        });

        it('should trigger logout when passed a 401 server error', async () => {
            const store = configureStore({
                entities: {
                    users: {
                        currentUserId: 'user',
                    },
                },
            });
            const dispatch = mockDispatch(store.dispatch);

            const error = new ClientError(Client4.getUrl(), {
                message: 'Failed to do something',
                status_code: 401,
                url: '/api/v4/foo/bar',
            });

            forceLogoutIfNecessary(error, dispatch, store.getState);

            assert.notEqual(Client4.token, token);
            assert.deepEqual(dispatch.actions, [{type: UserTypes.LOGOUT_SUCCESS, data: {}}]);
        });

        it('should do nothing when failing to log in', async () => {
            const store = configureStore({
                entities: {
                    users: {
                        currentUserId: 'user',
                    },
                },
            });
            const dispatch = mockDispatch(store.dispatch);

            const error = new ClientError(Client4.getUrl(), {
                message: 'Failed to do something',
                status_code: 401,
                url: '/api/v4/login',
            });

            forceLogoutIfNecessary(error, dispatch, store.getState);

            assert.equal(Client4.token, token);
            assert.deepEqual(dispatch.actions, []);
        });

        it('should do nothing when not logged in', async () => {
            const store = configureStore({
                entities: {
                    users: {
                        currentUserId: '',
                    },
                },
            });
            const dispatch = mockDispatch(store.dispatch);

            const error = new ClientError(Client4.getUrl(), {
                message: 'Failed to do something',
                status_code: 401,
                url: '/api/v4/foo/bar',
            });

            forceLogoutIfNecessary(error, dispatch, store.getState);

            assert.equal(Client4.token, token);
            assert.deepEqual(dispatch.actions, []);
        });
    });
});
