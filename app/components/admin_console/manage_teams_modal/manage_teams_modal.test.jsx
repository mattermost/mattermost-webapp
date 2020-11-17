// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {General} from 'mattermost-redux/constants';

import ManageTeamsModal from 'components/admin_console/manage_teams_modal/manage_teams_modal.jsx';

describe('ManageTeamsModal', () => {
    const baseProps = {
        locale: General.DEFAULT_LOCALE,
        onModalDismissed: jest.fn(),
        show: true,
        user: {
            id: 'currentUserId',
            last_picture_update: '1234',
            email: 'currentUser@test.com',
            roles: 'system_user',
            username: 'currentUsername',
        },
        actions: {
            getTeamMembersForUser: jest.fn().mockReturnValue(Promise.resolve({data: []})),
            getTeamsForUser: jest.fn().mockReturnValue(Promise.resolve({data: []})),
            updateTeamMemberSchemeRoles: jest.fn(),
            removeUserFromTeam: jest.fn(),
        },
    };

    test('should match snapshot init', () => {
        const wrapper = shallow(
            <ManageTeamsModal {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call api calls on mount', () => {
        shallow(
            <ManageTeamsModal {...baseProps}/>,
        );

        expect(baseProps.actions.getTeamMembersForUser).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.getTeamMembersForUser).toHaveBeenCalledWith('currentUserId');
        expect(baseProps.actions.getTeamsForUser).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.getTeamsForUser).toHaveBeenCalledWith('currentUserId');
    });

    test('should save data in state from api calls', (done) => {
        const mockTeamData = {
            id: '123test',
            name: 'testTeam',
            display_name: 'testTeam',
            delete_at: 0,
        };

        const getTeamMembersForUser = jest.fn().mockReturnValue(Promise.resolve({data: [{team_id: '123test'}]}));
        const getTeamsForUser = jest.fn().mockReturnValue(Promise.resolve({data: [mockTeamData]}));

        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                getTeamMembersForUser,
                getTeamsForUser,
            },
        };

        const wrapper = shallow(
            <ManageTeamsModal {...props}/>,
        );

        process.nextTick(() => {
            expect(wrapper.state('teams')).toEqual([mockTeamData]);
            expect(wrapper.state('teamMembers')).toEqual([{team_id: '123test'}]);
            expect(wrapper).toMatchSnapshot();
            done();
        });
    });
});
