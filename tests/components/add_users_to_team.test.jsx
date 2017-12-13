// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {shallow} from 'enzyme';

import AddUsersToTeam from 'components/add_users_to_team/add_users_to_team.jsx';

jest.useFakeTimers();

jest.mock('stores/team_store.jsx', () => {
    const original = require.requireActual('stores/team_store.jsx');
    return {
        ...original,
        getCurrentId: jest.fn(() => 'current_team_id'),
        getCurrent: jest.fn(() => {
            return {display_name: 'display_name'};
        })
    };
});

jest.mock('actions/team_actions.jsx');
jest.mock('actions/user_actions.jsx');

describe('components/AddUsersToTeam', () => {
    const baseProps = {
        onModalDismissed: jest.fn(),
        actions: {
            getProfilesNotInTeam: jest.fn()
        }
    };

    test('should match snapshot', () => {
        const actions = {
            getProfilesNotInTeam: jest.fn()
        };
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <AddUsersToTeam {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).exists()).toBe(true);
        expect(actions.getProfilesNotInTeam).toHaveBeenCalledTimes(1);
        expect(actions.getProfilesNotInTeam).toHaveBeenCalledWith('current_team_id', 0, 100);
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <AddUsersToTeam {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().handleHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called onModalDismissed when handleExit is called', () => {
        const onModalDismissed = jest.fn();
        const props = {...baseProps, onModalDismissed};
        const wrapper = shallow(
            <AddUsersToTeam {...props}/>
        );

        wrapper.instance().handleExit();
        expect(onModalDismissed).toHaveBeenCalledTimes(1);
    });

    test('should match state when handleResponse is called', () => {
        const wrapper = shallow(
            <AddUsersToTeam {...baseProps}/>
        );

        wrapper.setState({saving: true, addError: ''});
        wrapper.instance().handleResponse();
        expect(wrapper.state('saving')).toEqual(false);
        expect(wrapper.state('addError')).toEqual(null);

        const message = 'error message';
        wrapper.setState({saving: true, addError: ''});
        wrapper.instance().handleResponse({message});
        expect(wrapper.state('saving')).toEqual(false);
        expect(wrapper.state('addError')).toEqual(message);
    });

    test('should match state when handleSubmit is called', () => {
        const {addUsersToTeam} = require.requireMock('actions/team_actions.jsx');
        const wrapper = shallow(
            <AddUsersToTeam {...baseProps}/>
        );

        wrapper.setState({values: []});
        wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(addUsersToTeam).not.toBeCalled();

        wrapper.setState({saving: false, values: [{id: 'id_1'}, {id: 'id_2'}]});
        wrapper.instance().handleSubmit({preventDefault: jest.fn()});

        expect(addUsersToTeam).toBeCalled();
        expect(addUsersToTeam).toHaveBeenCalledTimes(1);
        expect(wrapper.state('saving')).toEqual(true);
    });

    test('should match state when addValue is called', () => {
        const wrapper = shallow(
            <AddUsersToTeam {...baseProps}/>
        );

        wrapper.setState({values: [{id: 'id_1'}]});
        wrapper.instance().addValue({id: 'id_2'});
        expect(wrapper.state('values')).toEqual([{id: 'id_1'}, {id: 'id_2'}]);

        wrapper.setState({values: [{id: 'id_1'}]});
        wrapper.instance().addValue({id: 'id_1'});
        expect(wrapper.state('values')).toEqual([{id: 'id_1'}]);
    });

    test('should match state when handlePageChange is called', () => {
        const actions = {
            getProfilesNotInTeam: jest.fn()
        };
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <AddUsersToTeam {...props}/>
        );

        wrapper.setState({users: [{id: 'id_1'}]});
        wrapper.instance().handlePageChange(0, 1);
        expect(actions.getProfilesNotInTeam).toHaveBeenCalledTimes(1);

        wrapper.instance().handlePageChange(1, 0);
        expect(actions.getProfilesNotInTeam).toHaveBeenCalledTimes(2);

        wrapper.instance().handlePageChange(0, 1);
        expect(actions.getProfilesNotInTeam).toHaveBeenCalledTimes(2);
    });

    test('should match state when search is called', () => {
        const {searchUsersNotInTeam} = require.requireMock('actions/user_actions.jsx');
        const wrapper = shallow(
            <AddUsersToTeam {...baseProps}/>
        );

        wrapper.instance().search('');
        jest.runAllTimers();
        expect(searchUsersNotInTeam).not.toBeCalled();

        const searchTerm = 'term';
        wrapper.instance().search(searchTerm);
        jest.runAllTimers();
        expect(wrapper.instance().term).toEqual(searchTerm);
        expect(searchUsersNotInTeam).toBeCalled();
        expect(searchUsersNotInTeam).toHaveBeenCalledTimes(1);
    });

    test('should match state when handleDelete is called', () => {
        const wrapper = shallow(
            <AddUsersToTeam {...baseProps}/>
        );

        wrapper.setState({values: [{id: 'id_1'}]});
        const newValues = [{id: 'id_2'}, {id: 'id_3'}];
        wrapper.instance().handleDelete(newValues);
        expect(wrapper.state('values')).toEqual(newValues);
    });

    test('should match when renderOption is called', () => {
        const wrapper = shallow(
            <AddUsersToTeam {...baseProps}/>
        );

        const option = {id: 'id', last_picture_update: '12345', email: 'test@test.com'};
        let isSelected = false;
        function onAdd() {} //eslint-disable-line no-empty-function

        expect(wrapper.instance().renderOption(option, isSelected, onAdd)).toMatchSnapshot();

        isSelected = true;
        expect(wrapper.instance().renderOption(option, isSelected, onAdd)).toMatchSnapshot();
    });

    test('should match when renderValue is called', () => {
        const wrapper = shallow(
            <AddUsersToTeam {...baseProps}/>
        );

        expect(wrapper.instance().renderValue({username: 'username'})).toEqual('username');
    });
});
