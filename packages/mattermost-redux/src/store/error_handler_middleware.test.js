// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';

import {ClientError} from '@mattermost/client';

import {ErrorTypes, UserTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';
import baseReducer from 'mattermost-redux/reducers';
import configureStore, {mockDispatch} from 'mattermost-redux/test/test_store';

import {errorHandlerMiddleware, forceLogoutIfNecessary} from './error_handler_middleware';

describe('errorHandlerMiddleware', () => {
    function makeMiddlewareTestStore(preloadedState) {
        const reducer = jest.fn(combineReducers(baseReducer));
        const store = createStore(reducer, preloadedState, applyMiddleware(errorHandlerMiddleware, thunk));

        // Remove the redux init action from the list of things the reducer mock has been called with
        reducer.mockReset();

        return {
            reducer,
            store,
        };
    }

    test('should dispatch and return a plain action', () => {
        const {reducer, store} = makeMiddlewareTestStore();

        const action = {type: 'A_PLAIN_ACTION'};

        const result = store.dispatch(action);

        expect(result).toBe(action);
        expect(reducer).toHaveBeenCalledWith(expect.anything(), action);
    });

    test('should call a synchronous thunk action and return its result', () => {
        const {reducer, store} = makeMiddlewareTestStore();

        const plainAction = {type: 'A_SYNC_THUNK_ACTION'};
        const action = (dispatch) => dispatch(plainAction);

        const result = store.dispatch(action);

        expect(result).toBe(plainAction);
        expect(reducer).toHaveBeenCalledWith(expect.anything(), plainAction);
    });

    test('should call a synchronous thunk action and log any error it throws', () => {
        const {reducer, store} = makeMiddlewareTestStore();

        const error = new Error('an error occurred');
        const action = () => {
            throw error;
        };

        const result = store.dispatch(action);

        expect(result).toEqual({error});
        expect(reducer).toHaveBeenCalledTimes(1);
        expect(reducer).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({type: ErrorTypes.LOG_ERROR}));
    });

    test('should call an asynchronous thunk action and return its dispatch result', async () => {
        const {reducer, store} = makeMiddlewareTestStore();

        const plainAction = {type: 'AN_ASYNC_THUNK_ACTION'};
        const action = async (dispatch) => dispatch(plainAction);

        const result = await store.dispatch(action);

        expect(result).toBe(plainAction);
        expect(reducer).toHaveBeenCalledWith(expect.anything(), plainAction);
    });

    test('should call an asynchronous thunk action and return its result', async () => {
        const {reducer, store} = makeMiddlewareTestStore();

        const plainAction = {type: 'AN_ASYNC_THUNK_ACTION'};
        const action = async (dispatch) => {
            dispatch(plainAction);
            return {data: true};
        };

        const result = await store.dispatch(action);

        expect(result).toEqual({data: true});
        expect(reducer).toHaveBeenCalledWith(expect.anything(), plainAction);
    });

    test('should call an asynchronous thunk action and log any error it throws', async () => {
        const {reducer, store} = makeMiddlewareTestStore();

        const error = new Error('an error occurred');
        const action = async () => {
            throw error;
        };

        const result = await store.dispatch(action);

        expect(result).toEqual({error});
        expect(reducer).toHaveBeenCalledTimes(1);
        expect(reducer).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({type: ErrorTypes.LOG_ERROR}));
    });

    test('should force a logout on a 401 error without logging an error', async () => {
        const {reducer, store} = makeMiddlewareTestStore({
            entities: {
                users: {
                    currentUserId: 'currentUserId',
                },
            },
        });

        const error = new ClientError('/api/v4/error', {
            name: '401Error',
            server_error_id: 'api.context.session_expired.app_error',
            message: 'an error occurred',
            status_code: 401,
            url: '/api/v4/error',
        });
        const action = async () => {
            throw error;
        };

        const result = await store.dispatch(action);

        expect(result).toEqual({error});
        expect(reducer).toHaveBeenCalledTimes(1);
        expect(reducer).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({type: UserTypes.LOGOUT_SUCCESS}));
    });
});

describe('forceLogoutIfNecessary', () => {
    const token = 'token';

    beforeEach(() => {
        Client4.setToken(token);
    });

    test('should do nothing when passed a client error', async () => {
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

        expect(Client4.token).toEqual(token);
        expect(dispatch.actions).toEqual([]);
    });

    test('should do nothing when passed a non-401 server error', async () => {
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

        expect(Client4.token).toEqual(token);
        expect(dispatch.actions).toEqual([]);
    });

    test('should trigger logout when passed a 401 server error', async () => {
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

        expect(Client4.token).not.toEqual(token);
        expect(dispatch.actions).toEqual([{type: UserTypes.LOGOUT_SUCCESS, data: {}}]);
    });

    test('should do nothing when failing to log in', async () => {
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

        expect(Client4.token).toEqual(token);
        expect(dispatch.actions).toEqual([]);
    });

    test('should do nothing when not logged in', async () => {
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

        expect(Client4.token).toEqual(token);
        expect(dispatch.actions).toEqual([]);
    });
});
