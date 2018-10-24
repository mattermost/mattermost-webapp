// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {General} from 'mattermost-redux/constants';

import ManageTeamsModal from 'components/admin_console/manage_teams_modal/manage_teams_modal.jsx';

describe('ManageTeamsModal', () => {
    function emptyFunc() {} // eslint-disable-line no-empty-function

    const baseProps = {
        locale: General.DEFAULT_LOCALE,
        onModalDismissed: emptyFunc,
        show: true,
        user: {
            id: 'currentUserId',
            last_picture_update: '1234',
            email: 'currentUser@test.com',
            roles: 'system_user',
            username: 'currentUsername',
        },
        actions: {
            getTeamMembersForUser: jest.fn(),
            getTeamsForUser: jest.fn(),
            updateTeamMemberSchemeRoles: emptyFunc,
        },
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

        expect(baseProps.actions.getTeamMembersForUser).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.getTeamMembersForUser).toHaveBeenCalledWith('currentUserId');
        expect(baseProps.actions.getTeamsForUser).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.getTeamsForUser).toHaveBeenCalledWith('currentUserId');
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

        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                getTeamMembersForUser,
                getTeamsForUser,
            },
        };

        const wrapper = shallow(
            <ManageTeamsModal {...props}/>
        );

        await getTeamMembersForUser();

        expect(wrapper.state('teams')).toEqual([mockTeamData]);
        expect(wrapper.state('teamMembers')).toEqual([{team_id: '123test'}]);
        expect(wrapper).toMatchSnapshot();
    });
});
