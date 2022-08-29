// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import assert from 'assert';

import {UserProfile} from '@mattermost/types/users';

import {ClientLicense} from '@mattermost/types/config';

import {checkIfMFARequired, ConfigOption} from './route';

describe('Utils.Route', () => {
    describe('checkIfMFARequired', () => {
        test('mfa is enforced', () => {
            const user: UserProfile = {mfa_active: false,
                auth_service: '',
                id: '',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                username: '',
                password: '',
                email: '',
                nickname: '',
                first_name: '',
                last_name: '',
                position: '',
                roles: '',
                props: {userid: '121'},
                notify_props: {desktop: 'default',
                    desktop_sound: 'false',
                    email: 'true',
                    mark_unread: 'all',
                    push: 'default',
                    push_status: 'ooo',
                    comments: 'never',
                    first_name: 'true',
                    channel: 'true',
                    mention_keys: ''},
                last_password_update: 0,
                last_picture_update: 0,
                locale: '',
                timezone: {useAutomaticTimezone: '', automaticTimezone: '', manualTimezone: ''},
                last_activity_at: 0,
                is_bot: false,
                bot_description: '',
                terms_of_service_id: '',
                terms_of_service_create_at: 0,
                remote_id: ''};
            const config: ConfigOption = {EnableMultifactorAuthentication: 'true', EnforceMultifactorAuthentication: 'true'};
            const license: ClientLicense = {MFA: 'true'};

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
            const user: UserProfile = {mfa_active: true,
                auth_service: '',
                id: '',
                create_at: 0,
                update_at: 0,
                delete_at: 0,
                username: '',
                password: '',
                email: '',
                nickname: '',
                first_name: '',
                last_name: '',
                position: '',
                roles: '',
                props: {userid: '121'},
                notify_props: {desktop: 'default',
                    desktop_sound: 'false',
                    email: 'true',
                    mark_unread: 'all',
                    push: 'default',
                    push_status: 'ooo',
                    comments: 'never',
                    first_name: 'true',
                    channel: 'true',
                    mention_keys: ''},
                last_password_update: 0,
                last_picture_update: 0,
                locale: '',
                timezone: {useAutomaticTimezone: '', automaticTimezone: '', manualTimezone: ''},
                last_activity_at: 0,
                is_bot: false,
                bot_description: '',
                terms_of_service_id: '',
                terms_of_service_create_at: 0,
                remote_id: ''};
            const config: ConfigOption = {EnableMultifactorAuthentication: 'true', EnforceMultifactorAuthentication: 'true'};
            const license: ClientLicense = {MFA: 'true'};
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
