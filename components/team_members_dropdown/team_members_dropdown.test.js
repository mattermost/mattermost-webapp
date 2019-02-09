// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamMembersDropdown from './team_members_dropdown';

describe('components/admin_console/system_users/system_users_dropdown/system_users_dropdown.jsx', () => {
    const user = {
        id: 'user_id',
        roles: '',
    };

    const requiredProps = {
        user,
        currentUser: {},
        currentChannelId: '',
        teamMember: {roles: '', team_id: 'teamId'},
        teamUrl: '',
        actions: {
            getUser: jest.fn(),
            getTeamStats: jest.fn(),
            getChannelStats: jest.fn(),
            getMyTeamUnreads: jest.fn(),
            getMyTeamMembers: jest.fn(),
            updateTeamMemberSchemeRoles: jest.fn(),
            removeUserFromTeamAndGetStats: jest.fn(),
            updateUserActive: jest.fn(() => Promise.resolve({})),
        },
    };

    test('handleMakeActive() should have called updateUserActive', async () => {
        const wrapper = shallow(<TeamMembersDropdown {...requiredProps}/>);

        await wrapper.instance().handleMakeActive();

        expect(requiredProps.actions.updateUserActive).toHaveBeenCalled();
        expect(requiredProps.actions.updateUserActive).toHaveBeenCalledWith(requiredProps.user.id, true);

        expect(requiredProps.actions.getTeamStats).toHaveBeenCalledTimes(0);
        expect(requiredProps.actions.getChannelStats).toHaveBeenCalledTimes(0);
    });

    test('handleMakeActive() should have called [getChannelStats, getTeamStats]', async () => {
        const updateUserActive = jest.fn(() => Promise.resolve({data: true}));
        const wrapper = shallow(
            <TeamMembersDropdown
                {...requiredProps}
                actions={{...requiredProps.actions, updateUserActive}}
            />
        );

        await wrapper.instance().handleMakeActive();

        expect(requiredProps.actions.getChannelStats).toHaveBeenCalled();
        expect(requiredProps.actions.getChannelStats).toHaveBeenCalledWith(requiredProps.currentChannelId);

        expect(requiredProps.actions.getTeamStats).toHaveBeenCalled();
        expect(requiredProps.actions.getTeamStats).toHaveBeenCalledWith(requiredProps.teamMember.team_id);
    });

    test('handleMakeNotActive() should have called updateUserActive', async () => {
        const wrapper = shallow(<TeamMembersDropdown {...requiredProps}/>);

        await wrapper.instance().handleMakeNotActive();

        expect(requiredProps.actions.updateUserActive).toHaveBeenCalled();
        expect(requiredProps.actions.updateUserActive).toHaveBeenCalledWith(requiredProps.user.id, false);

        expect(requiredProps.actions.getTeamStats).toHaveBeenCalledTimes(0);
        expect(requiredProps.actions.getChannelStats).toHaveBeenCalledTimes(0);
    });

    test('handleMakeNotActive() should have called [getChannelStats, getTeamStats]', async () => {
        const updateUserActive = jest.fn(() => Promise.resolve({data: true}));
        const wrapper = shallow(
            <TeamMembersDropdown
                {...requiredProps}
                actions={{...requiredProps.actions, updateUserActive}}
            />
        );

        await wrapper.instance().handleMakeNotActive();

        expect(requiredProps.actions.getChannelStats).toHaveBeenCalled();
        expect(requiredProps.actions.getChannelStats).toHaveBeenCalledWith(requiredProps.currentChannelId);

        expect(requiredProps.actions.getTeamStats).toHaveBeenCalled();
        expect(requiredProps.actions.getTeamStats).toHaveBeenCalledWith(requiredProps.teamMember.team_id);
    });
});
