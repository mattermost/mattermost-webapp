// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Channel, ChannelMembership, ChannelNotifyProps} from 'mattermost-redux/types/channels';
import {Bot} from 'mattermost-redux/types/bots';
import {Role} from 'mattermost-redux/types/roles';
import {UserProfile} from 'mattermost-redux/types/users';
import {Team, TeamMembership} from 'mattermost-redux/types/teams';
import {Group} from 'mattermost-redux/types/groups';
import {FileInfo} from 'mattermost-redux/types/files';
import {Post} from 'mattermost-redux/types/posts';

export class TestHelper {
    public static getUserMock(override: Partial<UserProfile> = {}): UserProfile {
        const defaultUser: UserProfile = {
            id: 'user_id',
            roles: '',
            username: 'some-user',
            password: '',
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
            allow_marketing: false,
            props: {},
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
                push_status: 'offline',
            },
            last_picture_update: 0,
            last_password_update: 0,
            failed_attempts: 0,
            mfa_active: false,
            mfa_secret: '',
            last_activity_at: 0,
            bot_description: '',
            bot_last_icon_update: 0,
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
            display_name: '',
        };
        return Object.assign({}, defaultBot, override);
    }

    public static getChannelMock(override: Partial<Channel>): Channel {
        const defaultChannel: Channel = {
            id: 'channel_id',
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            team_id: 'team_id',
            type: 'O',
            display_name: 'name',
            name: 'DN',
            header: 'header',
            purpose: 'purpose',
            last_post_at: 0,
            total_msg_count: 0,
            extra_update_at: 0,
            creator_id: 'id',
            scheme_id: 'id',
            group_constrained: false,
        };
        return Object.assign({}, defaultChannel, override);
    }

    public static getChannelMembershipMock(override: Partial<ChannelMembership>, overrideNotifyProps: Partial<ChannelNotifyProps>): ChannelMembership {
        const defaultNotifyProps = {
            desktop: 'default',
            email: 'default',
            mark_unread: 'all',
            push: 'default',
            ignore_channel_mentions: 'default',
        };
        const notifyProps = Object.assign({}, defaultNotifyProps, overrideNotifyProps);

        const defaultMembership: ChannelMembership = {
            channel_id: 'channel_id',
            user_id: 'user_id',
            roles: 'channel_user',
            last_viewed_at: 0,
            msg_count: 0,
            mention_count: 0,
            notify_props: notifyProps,
            last_update_at: 0,
            scheme_user: true,
            scheme_admin: false,
        };
        return Object.assign({}, defaultMembership, override);
    }

    public static getTeamMock(override?: Partial<Team>): Team {
        const defaultTeam: Team = {
            id: 'team_id',
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            type: 'O',
            display_name: 'name',
            name: 'DN',
            scheme_id: 'id',
            allow_open_invite: false,
            group_constrained: false,
            description: '',
            email: '',
            company_name: '',
            allowed_domains: '',
            invite_id: '',
        };
        return Object.assign({}, defaultTeam, override);
    }

    public static getTeamMembershipMock(override: Partial<TeamMembership>): TeamMembership {
        const defaultMembership: TeamMembership = {
            mention_count: 0,
            msg_count: 0,
            team_id: 'team_id',
            user_id: 'user_id',
            roles: 'team_user',
            delete_at: 0,
            scheme_user: true,
            scheme_admin: false,
        };
        return Object.assign({}, defaultMembership, override);
    }

    public static getRoleMock(override: Partial<Role> = {}): Role {
        const defaultRole: Role = {
            id: 'role_id',
            name: 'role_name',
            display_name: 'role_display_name',
            description: 'role_description',
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            permissions: [],
            scheme_managed: false,
            built_in: false,
        };
        return Object.assign({}, defaultRole, override);
    }

    public static getGroupMock(override: Partial<Group>): Group {
        const defaultGroup: Group = {
            id: 'group_id',
            name: 'group_name',
            display_name: 'group_display_name',
            description: '',
            type: '',
            remote_id: '',
            create_at: 1,
            update_at: 1,
            delete_at: 0,
            has_syncables: false,
            member_count: 0,
            scheme_admin: false,
            allow_reference: true,
        };
        return Object.assign({}, defaultGroup, override);
    }

    public static getPostMock(override: Partial<Post> = {}): Post {
        const defaultPost: Post = {
            edit_at: 0,
            original_id: '',
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
            channel_id: '',
            create_at: 0,
            delete_at: 0,
            id: 'id',
            is_pinned: false,
            message: 'post message',
            parent_id: '',
            props: {},
            root_id: '',
            type: 'system_add_remove',
            update_at: 0,
            user_id: 'user_id',
        };
        return Object.assign({}, defaultPost, override);
    }

    public static getFileInfoMock(override: Partial<FileInfo>): FileInfo {
        const defaultFileInfo: FileInfo = {
            id: 'file_info_id',
            user_id: 'user_id',
            create_at: 1,
            update_at: 1,
            delete_at: 1,
            name: 'name',
            extension: 'jpg',
            size: 1,
            mime_type: 'mime_type',
            has_preview_image: true,
            width: 350,
            height: 200,
            clientId: 'client_id',
        };
        return Object.assign({}, defaultFileInfo, override);
    }
}
