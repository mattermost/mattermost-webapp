// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Channel, ChannelMembership, ChannelNotifyProps} from 'mattermost-redux/types/channels';
import {Bot} from 'mattermost-redux/types/bots';
import {UserProfile} from 'mattermost-redux/types/users';
import {Team, TeamMembership} from 'mattermost-redux/types/teams';

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
                push_status: 'offline',
            },
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

    public static getTeamMock(override: Partial<Team>): Team {
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
}
