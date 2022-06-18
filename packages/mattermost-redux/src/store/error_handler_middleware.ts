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

export const errorHandlerMiddleware: ErrorHandlerMiddleware = ({dispatch, getState}) => (next) => async (action) => {
    let result;
    try {
        result = await next(action);
    } catch (error) {
        if (error instanceof Error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
        }

        return {error};
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

