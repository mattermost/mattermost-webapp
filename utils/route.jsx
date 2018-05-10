// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import UserStore from 'stores/user_store.jsx';
import {ErrorPageTypes} from 'utils/constants.jsx';

export function importComponentSuccess(callback) {
    return (comp) => callback(null, comp.default);
}

export function createGetChildComponentsFunction(arrayOfComponents) {
    return (locaiton, callback) => callback(null, arrayOfComponents);
}

export const notFoundParams = {
    type: ErrorPageTypes.PAGE_NOT_FOUND,
};

const mfaPaths = [
    '/mfa/setup',
    '/mfa/confirm',
];

const mfaAuthServices = [
    '',
    'email',
    'ldap',
];

export function checkIfMFARequired(license, config, path) {
    if (license.MFA === 'true' &&
            config.EnableMultifactorAuthentication === 'true' &&
            config.EnforceMultifactorAuthentication === 'true' &&
            mfaPaths.indexOf(path) === -1) {
        const user = UserStore.getCurrentUser();
        if (user && !user.mfa_active &&
                mfaAuthServices.indexOf(user.auth_service) !== -1) {
            return true;
        }
    }

    return false;
}

