// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AnyAction, Dispatch, Middleware} from 'redux';

import {ThunkDispatch} from 'redux-thunk';

import {GlobalState} from '@mattermost/types/store';

import {UserTypes} from 'mattermost-redux/action_types';

import {Client4} from 'mattermost-redux/client';

import {isServerError} from '@mattermost/types/errors';
import {logError} from 'mattermost-redux/actions/errors';

type ErrorHandlerMiddleware = Middleware<

// This middleware doesn't add anything to dispatch, and this is the TS version of an empty object
Record<string, never>,

// Since forceLogoutIfNecessary relies on getState, we need to define the type of state needed by this middleware
GlobalState,

// Since we dispatch a non-object action (logError), TS needs to know that we're dispatching to redux-thunk
ThunkDispatch<GlobalState, undefined, AnyAction>
>;

export const errorHandlerMiddleware: ErrorHandlerMiddleware = ({dispatch, getState}) => (next) => (action) => {
    function handleError(error: unknown) {
        if (error instanceof Error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
        }

        return {error};
    }

    // Hand the action off to the next middleware (likely thunk) or dispatch it
    let result: any;
    try {
        result = next(action);
    } catch (error) {
        // If an error was thrown synchronously, handle and return it
        return handleError(error);
    }

    if (result instanceof Promise) {
        // This is an async action, so handle the result asynchronously
        return new Promise((resolve) => {
            // If the async call succeeds, return its result. If it fails, handle the error and return that.
            result.then(resolve).catch((error: unknown) => resolve(handleError(error)));
        });
    }

    return result;
};

const HTTP_UNAUTHORIZED = 401;

export function forceLogoutIfNecessary<D extends Dispatch<AnyAction> = Dispatch<AnyAction>>(err: Error, dispatch: D, getState: () => GlobalState) {
    const {currentUserId} = getState().entities.users;
    if (
        isServerError(err) &&
        err.status_code === HTTP_UNAUTHORIZED &&
        (err.url && err.url.indexOf('/login') === -1) &&
        currentUserId
    ) {
        Client4.setToken('');
        dispatch({type: UserTypes.LOGOUT_SUCCESS, data: {}});
    }
}

