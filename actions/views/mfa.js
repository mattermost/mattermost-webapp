// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as UserActions from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

export function activateMfa(code) {
    return (dispatch, getState) => {
        const currentUserId = getCurrentUserId(getState());

        return dispatch(UserActions.updateUserMfa(currentUserId, true, code));
    };
}

export function deactivateMfa() {
    return (dispatch, getState) => {
        const currentUserId = getCurrentUserId(getState());

        return dispatch(UserActions.updateUserMfa(currentUserId, false));
    };
}

export function generateMfaSecret() {
    return (dispatch, getState) => {
        const currentUserId = getCurrentUserId(getState());

        return dispatch(UserActions.generateMfaSecret(currentUserId));
    };
}

export function checkMfa(loginId) {
    return (dispatch, getState) => {
        const config = getConfig(getState());

        if (config.EnableMultifactorAuthentication !== 'true') {
            return Promise.resolve({data: false});
        }

        return dispatch(UserActions.checkMfa(loginId));
    };
}
