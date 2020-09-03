// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamMembersDropdown from 'components/team_members_dropdown/';

describe('components/team_members_dropdown', () => {
    const user = {
        id: 'user-1',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        username: 'username1',
        password: 'horsebatterystaple',
        auth_data: '',
        auth_service: '',
        email: 'hello@world.com',
        email_verified: true,
        nickname: 'username1',
        first_name: 'Hello',
        last_name: 'World',
        position: '',
        roles: 'team_admin',
        allow_marketing: true,
        props: {},
        notify_props: {
            desktop: 'all' as const,
            desktop_sound: 'true' as const,
            email: 'true' as const,
            mark_unread: 'all' as const,
            push: 'default' as const,
            push_status: 'ooo' as const,
            comments: 'root' as const,
            first_name: 'true' as const,
            channel: 'true' as const,
            mention_keys: '' as const
        },
        last_password_update: 0,
        last_picture_update: 0,
        failed_attempts: 0,
        locale: '',
        mfa_active: true,
        mfa_secret: '',
        last_activity_at: 0,
        is_bot: false,
        bot_description: '',
        bot_last_icon_update: 0,
        terms_of_service_id: '',
        terms_of_service_create_at: 0,
    };

    const user2 = {
        id: 'user-2',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        username: 'username2',
        password: 'horsebatterystaple',
        auth_data: '',
        auth_service: '',
        email: 'bonjour@monde.com',
        email_verified: true,
        nickname: 'username2',
        first_name: 'Bonjour',
        last_name: 'Monde',
        position: '',
        roles: 'team_admin',
        allow_marketing: true,
        props: {},
        notify_props: {
            desktop: 'all' as const,
            desktop_sound: 'true' as const,
            email: 'true' as const,
            mark_unread: 'all' as const,
            push: 'default' as const,
            push_status: 'ooo' as const,
            comments: 'root' as const,
            first_name: 'true' as const,
            channel: 'true' as const,
            mention_keys: '' as const
        },
        last_password_update: 0,
        last_picture_update: 0,
        failed_attempts: 0,
        locale: '',
        mfa_active: true,
        mfa_secret: '',
        last_activity_at: 0,
        is_bot: false,
        bot_description: '',
        bot_last_icon_update: 0,
        terms_of_service_id: '',
        terms_of_service_create_at: 0,
    };

    const bot = {
        id: 'bot-user',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        username: 'bot',
        password: 'horsebatterystaple',
        auth_data: '',
        auth_service: '',
        email: 'bot@bot.com',
        email_verified: true,
        nickname: 'bot',
        first_name: 'Bot',
        last_name: '',
        position: '',
        roles: 'system_user',
        allow_marketing: true,
        props: {},
        notify_props: {
            desktop: 'all' as const,
            desktop_sound: 'true' as const,
            email: 'true' as const,
            mark_unread: 'all' as const,
            push: 'default' as const,
            push_status: 'ooo' as const,
            comments: 'root' as const,
            first_name: 'true' as const,
            channel: 'true' as const,
            mention_keys: '' as const
        },
        last_password_update: 0,
        last_picture_update: 0,
        failed_attempts: 0,
        locale: '',
        mfa_active: true,
        mfa_secret: '',
        last_activity_at: 0,
        is_bot: true,
        bot_description: '',
        bot_last_icon_update: 0,
        terms_of_service_id: '',
        terms_of_service_create_at: 0,
    };

    const team = {
        id: 'qkh1bxwgkjry3x4sgn5roa8ypy',
        create_at: 1553808980710,
        update_at: 1553808980710,
        delete_at: 0,
        display_name: 'engineering',
        name: 'engineering',
        description: '',
        email: 'sysadmin@test.com',
        type: 'O' as const,
        company_name: '',
        allowed_domains: '',
        invite_id: 'sgic8xqghb8iupttw6skeqifuo',
        allow_open_invite: false,
        scheme_id: 'serjktghwaljreglaw43q34qtl',
        group_constrained: true,
    };

    const baseProps = {
        user: user2,
        currentUser: user,
        teamMember: {
            mention_count: 0,
            msg_count: 0,
            team_id: 'sgic8dfgsdfgxqghb8iupttw6skeqifuo',
            user_id: 'sgic8xqghb8iup15fgsjjttw6skeqifuo',
            roles: 'channel_admin',
            delete_at: 0,
            scheme_user: true,
            scheme_admin: true,
        },
        teamUrl: '',
        currentTeam: team,
        index: 0,
        totalUsers: 10,
        actions: {
            getMyTeamMembers: jest.fn(),
            getMyTeamUnreads: jest.fn(),
            getUser: jest.fn(),
            getTeamMember: jest.fn(),
            getTeamStats: jest.fn(),
            getChannelStats: jest.fn(),
            updateTeamMemberSchemeRoles: jest.fn(),
            removeUserFromTeamAndGetStats: jest.fn(),
            updateUserActive: jest.fn(),
        },
    };

    test('should match snapshot for team_members_dropdown', () => {
        const wrapper = shallow(
            <TeamMembersDropdown {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot opening dropdown upwards', () => {
        const wrapper = shallow(
            <TeamMembersDropdown
                {...baseProps}
                index={4}
                totalUsers={5}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with group-constrained team', () => {
        baseProps.currentTeam.group_constrained = true;
        const wrapper = shallow(
            <TeamMembersDropdown {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for a bot with group-constrained team', () => {
        baseProps.currentTeam.group_constrained = true;
        baseProps.user = bot;
        const wrapper = shallow(
            <TeamMembersDropdown {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
