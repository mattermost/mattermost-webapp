// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as UserActions from 'mattermost-redux/actions/users';

export function loginById(userId, password, mfaToken) {
    return async (dispatch) => {
        let result = await dispatch(UserActions.loginById(userId, password, mfaToken));

        if (result.error && result.error.server_error_id === 'api.context.mfa_required.app_error') {
            result = {data: true};
        }

        return result;
    };
}
