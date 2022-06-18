// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ServerError} from '@mattermost/types/errors';

import {ActionFunc, GenericAction, DispatchFunc} from 'mattermost-redux/types/actions';

type ActionType = string;

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

export function requestFailure(type: ActionType, error: ServerError): any {
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
    return async (dispatch: DispatchFunc) => {
        if (onRequest) {
            dispatch(requestData(onRequest));
        }

        let data: any = null;
        try {
            data = await clientFunc(...params);
        } catch (error) {
            if (onFailure && error instanceof Error) {
                dispatch(requestFailure(onFailure, error));
            }

            throw error;
        }

        if (Array.isArray(onSuccess)) {
            onSuccess.forEach((s) => {
                dispatch(requestSuccess(s, data));
            });
        } else if (onSuccess) {
            dispatch(requestSuccess(onSuccess, data));
        }

        return {data};
    };
}

// Debounce function based on underscores modified to use es6 and a cb

export function debounce(func: (...args: any) => unknown, wait: number, immediate?: boolean, cb?: () => unknown) {
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
