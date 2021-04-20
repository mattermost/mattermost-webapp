// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {UserProfile} from 'mattermost-redux/types/users';
import {TeamMembership} from 'mattermost-redux/types/teams';

import {TestHelper} from 'utils/test_helper';

import UsersToRemove from './users_to_remove';

describe('components/admin_console/team_channel_settings/group/UsersToRemove', () => {
    function createUser(id: string, username: string, bot: boolean): UserProfile {
        return TestHelper.getUserMock({
            id,
            username,
            is_bot: bot,
        });
    }

    function createMembership(userId: string, admin: boolean): TeamMembership {
        return {
            mention_count: 0,
            msg_count: 0,
            mention_count_root: 0,
            msg_count_root: 0,
            team_id: 'team',
            user_id: userId,
            roles: admin ? 'team_user team_admin' : 'team_user',
            delete_at: 0,
            scheme_user: true,
            scheme_admin: admin,
        };
    }

    const user1 = createUser('userid1', 'user-1', false);
    const membership1 = createMembership('userId1', false);
    const user2 = createUser('userid2', 'user-2', false);
    const membership2 = createMembership('userId2', true);
    const scope: 'team' | 'channel' = 'team';
    const baseProps = {
        members: [user1, user2],
        memberships: {[user1.id]: membership1, [user2.id]: membership2},
        total: 2,
        searchTerm: '',
        scope,
        scopeId: 'team',
        enableGuestAccounts: true,
        filters: {},

        actions: {
            loadTeamMembersForProfilesList: jest.fn(),
            loadChannelMembersForProfilesList: jest.fn(),
            setModalSearchTerm: jest.fn(),
            setModalFilters: jest.fn(),
        },
    };

    test('should match snapshot with 2 users', () => {
        const wrapper = shallow(
            <UsersToRemove
                {...baseProps}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with guests disabled', () => {
        const wrapper = shallow(
            <UsersToRemove
                {...baseProps}
                enableGuestAccounts={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot searching with filters', () => {
        const wrapper = shallow(
            <UsersToRemove
                {...baseProps}
                searchTerm={'foo'}
                filters={{roles: ['system_user']}}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot loading', () => {
        const wrapper = shallow(
            <UsersToRemove
                {...baseProps}
            />,
        );

        wrapper.setState({loading: true});
        expect(wrapper).toMatchSnapshot();
    });
});
