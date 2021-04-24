// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Client4} from 'mattermost-redux/client';
import {UserTypes} from 'mattermost-redux/action_types';

import {Client4Error} from 'mattermost-redux/types/client4';
import {batchActions, Action, ActionFunc, GenericAction, DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {logError} from './errors';
type ActionType = string;
const HTTP_UNAUTHORIZED = 401;
export function forceLogoutIfNecessary(err: Client4Error, dispatch: DispatchFunc, getState: GetStateFunc) {
    const {currentUserId} = getState().entities.users;

    if ('status_code' in err && err.status_code === HTTP_UNAUTHORIZED && err.url && err.url.indexOf('/login') === -1 && currentUserId) {
        Client4.setToken('');
        dispatch({type: UserTypes.LOGOUT_SUCCESS, data: {}});
    }
}

function dispatcher(type: ActionType, data: any, dispatch: DispatchFunc) {
    if (type.indexOf('SUCCESS') === -1) { // we don't want to pass the data for the request types
        dispatch(requestSuccess(type, data));
    } else {
        dispatch(requestData(type));
    }
}

export function requestData(type: ActionType): GenericAction {
    return {
        type,
        data: null,
    };
}

export function requestSuccess(type: ActionType, data: any) {
    return {
        type,
        data,
    };
}

export function requestFailure(type: ActionType, error: Client4Error): any {
    return {
        type,
        error,
    };
}

/**
 * Returns an ActionFunc which calls a specfied (client) function and
 * dispatches the specifed actions on request, success or failure.
 *
 * @export
 * @param {Object} obj                                       an object for destructirung required properties
 * @param {() => Promise<mixed>} obj.clientFunc              clientFunc to execute
 * @param {ActionType} obj.onRequest                         ActionType to dispatch on request
 * @param {(ActionType | Array<ActionType>)} obj.onSuccess   ActionType to dispatch on success
 * @param {ActionType} obj.onFailure                         ActionType to dispatch on failure
 * @param {...Array<any>} obj.params
 * @returns {ActionFunc} ActionFunc
 */

export function bindClientFunc({
    clientFunc,
    onRequest,
    onSuccess,
    onFailure,
    params = [],
}: {
    clientFunc: (...args: any[]) => Promise<any>;
    onRequest?: ActionType;
    onSuccess?: ActionType | ActionType[];
    onFailure?: ActionType;
    params?: any[];
}): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        if (onRequest) {
            dispatch(requestData(onRequest));
        }

        let data: any = null;
        try {
            data = await clientFunc(...params);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            const actions: Action[] = [logError(error)];
            if (onFailure) {
                actions.push(requestFailure(onFailure, error));
            }
            dispatch(batchActions(actions));
            return {error};
        }

        if (Array.isArray(onSuccess)) {
            onSuccess.forEach((s) => {
                dispatcher(s, data, dispatch);
            });
        } else if (onSuccess) {
            dispatcher(onSuccess, data, dispatch);
        }

        return {data};
    };
}

// Debounce function based on underscores modified to use es6 and a cb

export function debounce(func: (...args: any) => unknown, wait: number, immediate: boolean, cb: () => unknown) {
    let timeout: NodeJS.Timeout|null;
    return function fx(...args: any[]) {
        const runLater = () => {
            timeout = null;
            if (!immediate) {
                Reflect.apply(func, null, args);
                if (cb) {
                    cb();
                }
            }
        };
        const callNow = immediate && !timeout;
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(runLater, wait);
        if (callNow) {
            Reflect.apply(func, null, args);
            if (cb) {
                cb();
            }
        }
    };
}

export class FormattedError extends Error {
    intl: {
        id: string;
        defaultMessage: string;
        values: any;
    };

    constructor(id: string, defaultMessage: string, values: any = {}) {
        super(defaultMessage);
        this.intl = {
            id,
            defaultMessage,
            values,
        };
    }
}

