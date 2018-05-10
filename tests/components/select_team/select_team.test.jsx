// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {General} from 'mattermost-redux/constants';

import SelectTeam from 'components/select_team/select_team.jsx';

import {emitUserLoggedOutEvent} from 'actions/global_actions.jsx';
import {addUserToTeamFromInvite} from 'actions/team_actions.jsx';

jest.mock('actions/global_actions.jsx', () => ({
    emitUserLoggedOutEvent: jest.fn(),
}));

jest.mock('actions/team_actions.jsx', () => ({
    addUserToTeamFromInvite: jest.fn(),
}));

jest.mock('utils/policy_roles_adapter', () => ({
    mappingValueFromRoles: jest.fn(),
}));

describe('components/select_team/SelectTeam', () => {
    const baseProps = {
        isLicensed: true,
        currentUserRoles: 'system_admin',
        enableTeamCreation: true,
        isMemberOfTeam: true,
        joinableTeams: [
            {id: 'team_id_1', delete_at: 0, name: 'team-a', display_name: 'Team A'},
            {id: 'team_id_2', delete_at: 0, name: 'b-team', display_name: 'B Team'},
        ],
        roles: {system_admin: {name: 'system_admin'}, system_user: {name: 'system_user'}},
        siteName: 'Mattermost',
        actions: {
            getTeams: jest.fn(),
            loadRolesIfNeeded: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const props = {...baseProps};
        const wrapper = shallow(<SelectTeam {...props}/>);
        expect(wrapper).toMatchSnapshot();

        // on componentWillMount
        expect(props.actions.loadRolesIfNeeded).toHaveBeenCalledTimes(1);
        expect(props.actions.loadRolesIfNeeded).toHaveBeenCalledWith([General.SYSTEM_ADMIN_ROLE, General.SYSTEM_USER_ROLE]);

        // on componentDidMount
        expect(props.actions.getTeams).toHaveBeenCalledTimes(1);
        expect(props.actions.getTeams).toHaveBeenCalledWith(0, 200);
    });

    test('should match snapshot, on loading', () => {
        const wrapper = shallow(<SelectTeam {...baseProps}/>);
        wrapper.setState({loadingTeamId: 'loading_team_id'});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on error', () => {
        const wrapper = shallow(<SelectTeam {...baseProps}/>);
        wrapper.setState({error: {message: 'error message'}});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on no joinable team but can create team', () => {
        const props = {...baseProps, joinableTeams: []};
        const wrapper = shallow(<SelectTeam {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on no joinable team and is not system admin nor can create team', () => {
        const props = {...baseProps, joinableTeams: [], currentUserRoles: '', enableTeamCreation: false};
        const wrapper = shallow(<SelectTeam {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state and call addUserToTeamFromInvite on handleTeamClick', () => {
        const wrapper = shallow(<SelectTeam {...baseProps}/>);
        wrapper.instance().handleTeamClick({id: 'team_id'});
        expect(wrapper.state('loadingTeamId')).toEqual('team_id');
        expect(addUserToTeamFromInvite).toHaveBeenCalledTimes(1);
    });

    test('should call emitUserLoggedOutEvent on handleLogoutClick', () => {
        const wrapper = shallow(<SelectTeam {...baseProps}/>);
        wrapper.instance().handleLogoutClick({preventDefault: jest.fn()});
        expect(emitUserLoggedOutEvent).toHaveBeenCalledTimes(1);
        expect(emitUserLoggedOutEvent).toHaveBeenCalledWith('/login');
    });

    test('should match state on clearError', () => {
        const wrapper = shallow(<SelectTeam {...baseProps}/>);
        wrapper.setState({error: {message: 'error message'}});
        wrapper.instance().clearError({preventDefault: jest.fn()});
        expect(wrapper.state('error')).toBeNull();
    });
});
