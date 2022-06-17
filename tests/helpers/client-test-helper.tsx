// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from '@mattermost/types/users';
import {Team} from '@mattermost/types/teams';
import {Channel} from '@mattermost/types/channels';
import {Post} from '@mattermost/types/posts';

import {Client4} from 'mattermost-redux/client';

import WebSocketClient from 'client/websocket_client';

class TestHelperClass {
    private basicu!: UserProfile;
    private basict!: Team;
    private basicch!: Channel;
    private basicp!: Post;
    private basicwsc!: WebSocketClient;
    private basicc!: typeof Client4;

    basicClient = () => {
        return this.basicc;
    }

    basicWebSocketClient = () => {
        return this.basicwsc;
    }

    basicTeam = () => {
        return this.basict;
    }

    basicUser = () => {
        return this.basicu;
    }

    basicChannel = () => {
        return this.basicch;
    }

    basicPost = () => {
        return this.basicp;
    }

    generateId = () => {
        // implementation taken from http://stackoverflow.com/a/2117523
        let id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

        id = id.replace(/[xy]/g, function replaceRandom(c) {
            const r = Math.floor(Math.random() * 16);

            let v;
            if (c === 'x') {
                v = r;
            } else {
                v = (r & 0x3) | 0x8;
            }

            return v.toString(16);
        });

        return 'uid' + id;
    }

    createClient() {
        const c = new (Client4 as any)();
        c.setUrl('http://localhost:8065');
        c.useHeaderToken();
        c.enableLogErrorsToConsole(true);
        return c;
    }

    createWebSocketClient(token: string) {
        const ws = new WebSocketClient();
        ws.initialize('http://localhost:8065/api/v4/websocket', token);
        return ws;
    }

    fakeEmail = () => {
        return 'success' + this.generateId() + '@simulator.amazonses.com';
    }

    fakeUser = (): UserProfile => {
        const id = this.generateId();
        return {
            email: this.fakeEmail(),
            allow_marketing: true,
            password: 'password1',
            username: id,
            id,

            create_at: 0,
            update_at: 0,
            delete_at: 0,
            auth_data: '',
            auth_service: '',
            email_verified: false,
            nickname: '',
            first_name: '',
            last_name: '',
            position: '',
            roles: '',
            props: {},
            notify_props: {
                desktop: 'default',
                desktop_sound: 'false',
                email: 'false',
                mark_unread: 'mention',
                push: 'default',
                push_status: 'online',
                comments: 'never',
                first_name: 'true',
                channel: 'true',
                mention_keys: '',
            },
            last_password_update: 0,
            last_picture_update: 0,
            failed_attempts: 0,
            locale: '',
            mfa_active: false,
            mfa_secret: '',
            last_activity_at: 0,
            is_bot: false,
            bot_description: '',
            bot_last_icon_update: 0,
            terms_of_service_id: '',
            terms_of_service_create_at: 0,
        };
    }

    fakeTeam = (): Team => {
        const name = this.generateId();
        return {
            name,
            display_name: `Unit Test ${name}`,
            type: 'O',
            email: this.fakeEmail(),
            allowed_domains: '',
            id: '',
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            description: '',
            company_name: '',
            invite_id: '',
            allow_open_invite: false,
            scheme_id: '',
            group_constrained: false,
        };
    }

    fakeChannel = (): Channel => {
        const name = this.generateId();
        return {
            id: '',
            name,
            display_name: `Unit Test ${name}`,
            type: 'O', // open channel
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            team_id: '',
            header: '',
            purpose: '',
            last_post_at: 0,
            last_root_post_at: 0,
            creator_id: '',
            scheme_id: '',
            group_constrained: false,
        };
    }

    fakePost = (): Post => {
        return {
            message: `Unit Test ${this.generateId()}`,
            id: '',
            create_at: 0,
            update_at: 0,
            edit_at: 0,
            delete_at: 0,
            is_pinned: false,
            user_id: '',
            channel_id: '',
            root_id: '',
            original_id: '',
            type: 'system_add_remove',
            props: {},
            hashtags: '',
            pending_post_id: '',
            reply_count: 0,
            metadata: {
                embeds: [],
                emojis: [],
                files: [],
                images: {},
                reactions: [],
            },
        };
    }

    fakeBot = () => {
        return {
            user_id: this.generateId(),
            username: this.generateId(),
            display_name: 'Fake bot',
            description: 'This is a fake bot',
            owner_id: this.generateId(),
            create_at: 1507840900004,
            update_at: 1507840900004,
            delete_at: 0,
        };
    }

    randomString = (length: number) => {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    initBasic = () => {
        this.basicc = this.createClient();

        const email = this.fakeEmail();
        const user = this.fakeUser();
        const team = this.fakeTeam();
        team.email = email;
        user.email = email;

        this.basicClient().createUser(user, '', '', '');
    }
}

const TestHelper = new TestHelperClass();
export default TestHelper;
