// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DispatchFunc} from 'mattermost-redux/types/actions';
import * as UserActions from 'mattermost-redux/actions/users';

export function login(loginId: string, password: string, mfaToken: string) {
    return (dispatch: DispatchFunc) => {
        return ignoreMfaRequiredError(dispatch(UserActions.login(loginId, password, mfaToken)));
    };
}

export function loginById(userId: string, password: string, mfaToken: string) {
    return (dispatch: DispatchFunc) => {
        return ignoreMfaRequiredError(dispatch(UserActions.loginById(userId, password, mfaToken)));
    };
}

async function ignoreMfaRequiredError(promise: Promise<any>) {
    let result = await promise;

    if (result.error && result.error.server_error_id === 'api.context.mfa_required.app_error') {
        result = {data: true};
    }

    return result;
}
