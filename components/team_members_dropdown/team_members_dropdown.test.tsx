// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamMembersDropdown from 'components/team_members_dropdown/team_members_dropdown';

import {TestHelper} from '../../utils/test_helper';

describe('components/team_members_dropdown', () => {
    const user = TestHelper.getUserMock({id: 'user-1', username: 'username1'});

    const user2 = TestHelper.getUserMock({id: 'user-2', username: 'username2'});

    const bot = TestHelper.getUserMock({id: 'bot-user', username: 'bot', is_bot: true});

    const team = TestHelper.getTeamMock();

    const baseProps = {
        user: user2,
        currentUser: user,
        teamMember: TestHelper.getTeamMembershipMock({roles: 'channel_admin', scheme_admin: true, scheme_user: true}),
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
