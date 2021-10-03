// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import UserProfile from 'components/user_profile/user_profile';
import { ErrorPageTypes } from 'utils/constants';
import { isGuest } from 'utils/utils.jsx';
import { ClientLicense } from '../packages/mattermost-redux/src/types/config';

export function importComponentSuccess(callback: any): any {
    return (comp:any) => callback(null, comp.default);
}

export function createGetChildComponentsFunction(arrayOfComponents: []): any {
    return (locaiton: string, callback: any) => callback(null, arrayOfComponents);
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

export type License = ClientLicense &{
    MFA: string;
}

export type ConfigOption = {
    EnableMultifactorAuthentication?: string;
    EnforceMultifactorAuthentication?: string;
    GuestAccountsEnforceMultifactorAuthentication?: string;
}

export type myuser = {
    mfa_active: boolean;
    auth_service: string;
}

export function checkIfMFARequired(user: myuser, license: License, config: ConfigOption, path: string): boolean {
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
