// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';

export function addLine(data: any): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        // TODO: Use the action constant here
        return dispatch({
            data,
            type: 'add-line',
        });
    };
}

export function clearLines(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        // TODO: Use the action constant here
        return dispatch({
            type: 'clear-lines',
        });
    };
}
