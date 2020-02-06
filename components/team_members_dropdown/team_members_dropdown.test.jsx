// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamMembersDropdown from 'components/team_members_dropdown/team_members_dropdown.jsx';

describe('components/team_members_dropdown', () => {
    const user = {
        id: 'user-1',
        username: 'username1',
        roles: 'team_admin',
        is_bot: false,
    };

    const user2 = {
        id: 'user-2',
        username: 'username2',
        roles: 'team_admin',
        is_bot: false,
    };

    const bot = {
        id: 'bot-user',
        username: 'bot',
        roles: 'system_user',
        is_bot: true,
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
        type: 'O',
        company_name: '',
        allowed_domains: '',
        invite_id: 'sgic8xqghb8iupttw6skeqifuo',
        allow_open_invite: false,
        scheme_id: null,
    };

    const baseProps = {
        user: user2,
        currentUser: user,
        teamMember: {
            roles: 'channel_admin',
            scheme_admin: 'system_admin',
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
            <TeamMembersDropdown {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot opening dropdown upwards', () => {
        const wrapper = shallow(
            <TeamMembersDropdown
                {...baseProps}
                index={4}
                totalUsers={5}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with group-constrained team', () => {
        baseProps.currentTeam.group_constrained = true;
        const wrapper = shallow(
            <TeamMembersDropdown {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for a bot with group-constrained team', () => {
        baseProps.currentTeam.group_constrained = true;
        baseProps.user = bot;
        const wrapper = shallow(
            <TeamMembersDropdown {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
