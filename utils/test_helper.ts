// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {UserProfile} from 'mattermost-redux/types/users';
import {Bot} from 'mattermost-redux/types/bots';

export class TestHelper {
    public static getUserMock(override: Partial<UserProfile> = {}): UserProfile {
        const defaultUser: UserProfile = {
            id: 'user_id',
            roles: '',
            username: 'some-user',
            auth_data: '',
            auth_service: '',
            create_at: 0,
            delete_at: 0,
            email: '',
            email_verified: true,
            first_name: '',
            last_name: '',
            locale: '',
            nickname: '',
            position: '',
            terms_of_service_create_at: 0,
            terms_of_service_id: '',
            update_at: 0,
            is_bot: false,
            last_picture_update: 0,
            notify_props: {
                channel: 'false',
                comments: 'never',
                desktop: 'default',
                desktop_sound: 'false',
                email: 'false',
                first_name: 'false',
                mark_unread: 'mention',
                mention_keys: '',
                push: 'none',
                push_status: 'offline'
            }
        };
        return Object.assign({}, defaultUser, override);
    }

    public static getBotMock(override: Partial<Bot>): Bot {
        const defaultBot: Bot = {
            create_at: 0,
            delete_at: 0,
            owner_id: '',
            update_at: 0,
            user_id: '',
            username: '',
            description: '',
            display_name: ''
        };
        return Object.assign({}, defaultBot, override);
    }
}
