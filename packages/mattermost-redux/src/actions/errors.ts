// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {serializeError, ErrorObject} from 'serialize-error';

import {ErrorTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';
import EventEmitter from 'mattermost-redux/utils/event_emitter';
import {DispatchFunc, ActionFunc} from 'mattermost-redux/types/actions';
import {ServerError} from 'mattermost-redux/types/errors';

export function dismissErrorObject(index: number) {
    return {
        type: ErrorTypes.DISMISS_ERROR,
        index,
        data: null,
    };
}

export function dismissError(index: number): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        dispatch(dismissErrorObject(index));

        return {data: true};
    };
}

export function getLogErrorAction(error: ErrorObject, displayable = false) {
    return {
        type: ErrorTypes.LOG_ERROR,
        displayable,
        error,
        data: null,
    };
}

export function logError(error: ServerError, displayable = false): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        if (error.server_error_id === 'api.context.session_expired.app_error') {
            return {data: true};
        }

        const serializedError = serializeError(error);

        let sendToServer = true;
        if (error.stack && error.stack.includes('TypeError: Failed to fetch')) {
            sendToServer = false;
        }
        if (error.server_error_id) {
            sendToServer = false;
        }

        if (sendToServer) {
            try {
                const stringifiedSerializedError = JSON.stringify(serializedError).toString();
                await Client4.logClientError(stringifiedSerializedError);
            } catch (err) {
                // avoid crashing the app if an error sending
                // the error occurs.
            }
        }

        EventEmitter.emit(ErrorTypes.LOG_ERROR, error);
        dispatch(getLogErrorAction(serializedError, displayable));

        return {data: true};
    };
}

export function clearErrors(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        dispatch({type: ErrorTypes.CLEAR_ERRORS, data: null});

        return {data: true};
    };
}
