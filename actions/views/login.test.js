// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

jest.mock('mattermost-redux/actions/users');

import * as UserActions from 'mattermost-redux/actions/users';

import {
    login,
    loginById,
} from 'actions/views/login';
import configureStore from 'store';

describe('actions/views/login', () => {
    describe('login', () => {
        test('should return successful when login is successful', async () => {
            const store = configureStore();

            UserActions.login.mockImplementation(() => () => ({data: true}));

            const result = await store.dispatch(login('user', 'password', ''));

            expect(UserActions.login).toHaveBeenCalled();
            expect(result).toEqual({data: true});
        });

        test('should return successful even if MFA is required', async () => {
            const store = configureStore();

            UserActions.login.mockImplementation(() => () => ({error: {server_error_id: 'api.context.mfa_required.app_error'}}));

            const result = await store.dispatch(login('user', 'password', ''));

            expect(UserActions.login).toHaveBeenCalled();
            expect(result).toEqual({data: true});
        });

        test('should return error when when login fails', async () => {
            const store = configureStore();

            UserActions.login.mockImplementation(() => () => ({error: {server_error_id: 'something_broke'}}));

            const result = await store.dispatch(login('user', 'password', ''));

            expect(UserActions.login).toHaveBeenCalled();
            expect(result).toEqual({error: {server_error_id: 'something_broke'}});
        });
    });

    describe('loginById', () => {
        test('should return successful when login is successful', async () => {
            const store = configureStore();

            UserActions.loginById.mockImplementation(() => () => ({data: true}));

            const result = await store.dispatch(loginById('userId', 'password', ''));

            expect(UserActions.loginById).toHaveBeenCalled();
            expect(result).toEqual({data: true});
        });

        test('should return successful even if MFA is required', async () => {
            const store = configureStore();

            UserActions.loginById.mockImplementation(() => () => ({error: {server_error_id: 'api.context.mfa_required.app_error'}}));

            const result = await store.dispatch(loginById('userId', 'password', ''));

            expect(UserActions.loginById).toHaveBeenCalled();
            expect(result).toEqual({data: true});
        });

        test('should return error when when login fails', async () => {
            const store = configureStore();

            UserActions.loginById.mockImplementation(() => () => ({error: {server_error_id: 'something_broke'}}));

            const result = await store.dispatch(loginById('userId', 'password', ''));

            expect(UserActions.loginById).toHaveBeenCalled();
            expect(result).toEqual({error: {server_error_id: 'something_broke'}});
        });
    });
});
