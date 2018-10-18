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
        getTeamMembersForUser: emptyFunc,
        getTeamsForUser: emptyFunc,
    };

    test('should match snapshot init', () => {
        const getTeamMembersForUser = jest.fn();
        const getTeamsForUser = jest.fn();

        const wrapper = shallow(
            <ManageTeamsModal
                {...baseProps}
                getTeamMembersForUser={getTeamMembersForUser}
                getTeamsForUser={getTeamsForUser}
            />
        );

        expect(wrapper).toMatchSnapshot();
        expect(getTeamMembersForUser).toHaveBeenCalledTimes(1);
        expect(getTeamMembersForUser).toHaveBeenCalledWith('currentUserId');
        expect(getTeamsForUser).toHaveBeenCalledTimes(1);
        expect(getTeamsForUser).toHaveBeenCalledWith('currentUserId');
    });

    test('should save data in state from api calls', async () => {
        const mockTeamData = {
            id: '123test',
            name: 'testTeam',
            display_name: 'testTeam',
            delete_at: 0,
        };

        const getTeamMembersForUser = async () => {
            return {
                data: [{team_id: '123test'}],
            };
        };

        const getTeamsForUser = async () => {
            return {
                data: [mockTeamData],
            };
        };

        const wrapper = shallow(
            <ManageTeamsModal
                {...baseProps}
                getTeamMembersForUser={getTeamMembersForUser}
                getTeamsForUser={getTeamsForUser}
            />
        );

        await getTeamsForUser();
        await getTeamMembersForUser();

        expect(wrapper.state('teams')).toEqual([mockTeamData]);
        expect(wrapper.state('teamMembers')).toEqual([{team_id: '123test'}]);

        expect(wrapper).toMatchSnapshot();
    });
});
