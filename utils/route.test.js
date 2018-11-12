// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import assert from 'assert';

import {checkIfMFARequired} from 'utils/route';

describe('Utils.Route', () => {
    describe('checkIfMFARequired', () => {
        test('mfa is enforced', () => {
            const user = {mfa_active: false, auth_service: ''};
            const config = {EnableMultifactorAuthentication: 'true', EnforceMultifactorAuthentication: 'true'};
            const license = {MFA: 'true'};

            assert.ok(checkIfMFARequired(user, license, config, ''));
            assert.ok(!checkIfMFARequired(user, license, config, '/mfa/setup'));
            assert.ok(!checkIfMFARequired(user, license, config, '/mfa/confirm'));

            user.auth_service = 'email';
            assert.ok(checkIfMFARequired(user, license, config, ''));

            user.auth_service = 'ldap';
            assert.ok(checkIfMFARequired(user, license, config, ''));

            user.auth_service = 'saml';
            assert.ok(!checkIfMFARequired(user, license, config, ''));

            user.auth_service = '';
            user.mfa_active = true;
            assert.ok(!checkIfMFARequired(user, license, config, ''));
        });

        test('mfa is not enforced or enabled', () => {
            const user = {mfa_active: false, auth_service: ''};
            const config = {EnableMultifactorAuthentication: 'true', EnforceMultifactorAuthentication: 'false'};
            const license = {MFA: 'true'};
            assert.ok(!checkIfMFARequired(user, license, config, ''));

            config.EnforceMultifactorAuthentication = 'true';
            config.EnableMultifactorAuthentication = 'false';
            assert.ok(!checkIfMFARequired(user, license, config, ''));

            license.MFA = 'false';
            config.EnableMultifactorAuthentication = 'true';
            assert.ok(!checkIfMFARequired(user, license, config, ''));
        });
    });
});
