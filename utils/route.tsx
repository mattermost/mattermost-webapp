// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ErrorPageTypes} from 'utils/constants';
import {isGuest} from 'utils/utils.jsx';

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

export function checkIfMFARequired(user, license, config, path) {
    if (license.MFA === 'true' &&
            config.EnableMultifactorAuthentication === 'true' &&
            config.EnforceMultifactorAuthentication === 'true' &&
            mfaPaths.indexOf(path) === -1) {
        if (isGuest(user) && config.GuestAccountsEnforceMultifactorAuthentication !== 'true') {
            return false;
        }

        if (user && !user.mfa_active &&
                mfaAuthServices.indexOf(user.auth_service) !== -1) {
            return true;
        }
    }

    return false;
}

