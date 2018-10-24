// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ManageTeamsModal from 'components/admin_console/manage_teams_modal/manage_teams_modal.jsx';

describe('ManageTeamsModal', () => {
    function emptyFunc() {} // eslint-disable-line no-empty-function

    const baseProps = {
        onModalDismissed: emptyFunc,
        show: true,
        user: {
            id: 'currentUserId',
            last_picture_update: '1234',
            email: 'currentUser@test.com',
            roles: 'system_user',
            username: 'currentUsername',
        },
        updateTeamMemberSchemeRoles: emptyFunc,
        getTeamMembersForUser: jest.fn(),
        getTeamsForUser: jest.fn(),
    };

    test('should match snapshot init', () => {
        const wrapper = shallow(
            <ManageTeamsModal {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call api calls on mount', () => {
        shallow(
            <ManageTeamsModal {...baseProps}/>
        );

        expect(baseProps.getTeamMembersForUser).toHaveBeenCalledTimes(1);
        expect(baseProps.getTeamMembersForUser).toHaveBeenCalledWith('currentUserId');
        expect(baseProps.getTeamsForUser).toHaveBeenCalledTimes(1);
        expect(baseProps.getTeamsForUser).toHaveBeenCalledWith('currentUserId');
    });

    test('should save data in state from api calls', async () => {
        const mockTeamData = {
            id: '123test',
            name: 'testTeam',
            display_name: 'testTeam',
            delete_at: 0,
        };

        const getTeamMembersForUser = jest.fn(() => {
            return Promise.resolve({
                data: [{team_id: '123test'}],
            });
        });

        const getTeamsForUser = jest.fn(() => {
            return Promise.resolve({data: [mockTeamData]});
        });

        const wrapper = shallow(
            <ManageTeamsModal
                {...baseProps}
                getTeamMembersForUser={getTeamMembersForUser}
                getTeamsForUser={getTeamsForUser}
            />
        );

        process.nextTick(() => {
            expect(wrapper.state('teams')).toEqual([mockTeamData]);
            expect(wrapper.state('teamMembers')).toEqual([{team_id: '123test'}]);
            expect(wrapper).toMatchSnapshot();
        });
    });
});
