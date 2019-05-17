// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {shallow} from 'enzyme';

import AddUsersToTeam from 'components/add_users_to_team/add_users_to_team.jsx';

describe('components/AddUsersToTeam', () => {
    const baseActions = {
        getProfilesNotInTeam: jest.fn().mockResolvedValue({data: true}),
        setModalSearchTerm: jest.fn().mockResolvedValue({data: true}),
        searchProfiles: jest.fn().mockResolvedValue({data: true}),
        addUsersToTeam: jest.fn().mockResolvedValue({data: true}),
        loadStatusesForProfilesList: jest.fn().mockResolvedValue({data: true}),
    };
    const baseProps = {
        currentTeamId: 'current_team_id',
        currentTeamName: 'display_name',
        searchTerm: '',
        users: [{id: 'someid', username: 'somename', email: 'someemail'}],
        onHide: jest.fn(),
        actions: baseActions,
    };

    test('should match snapshot', () => {
        const getProfilesNotInTeam = jest.fn().mockResolvedValue({data: true});
        const actions = {...baseActions, getProfilesNotInTeam};
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <AddUsersToTeam {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).exists()).toBe(true);
        expect(actions.getProfilesNotInTeam).toHaveBeenCalledTimes(1);
        expect(actions.getProfilesNotInTeam).toHaveBeenCalledWith('current_team_id', false, 0, 100);
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <AddUsersToTeam {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().handleHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called onHide when handleExit is called', () => {
        const onHide = jest.fn();
        const props = {...baseProps, onHide};
        const wrapper = shallow(
            <AddUsersToTeam {...props}/>
        );

        wrapper.instance().handleExit();
        expect(onHide).toHaveBeenCalledTimes(1);
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

    test('should match state when handleSubmit is called', async () => {
        const addUsersToTeam = jest.fn().
            mockResolvedValueOnce({error: true}).
            mockResolvedValue({data: true});
        const actions = {...baseProps.actions, addUsersToTeam};
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <AddUsersToTeam {...props}/>
        );
        const instance = wrapper.instance();
        instance.handleResponse = jest.fn();
        instance.handleHide = jest.fn();

        wrapper.setState({values: []});
        await wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(actions.addUsersToTeam).not.toBeCalled();

        wrapper.setState({saving: false, values: [{id: 'id_1'}, {id: 'id_2'}]});
        await wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(actions.addUsersToTeam).toBeCalled();
        expect(actions.addUsersToTeam).toHaveBeenCalledTimes(1);
        expect(actions.addUsersToTeam).toBeCalledWith('current_team_id', ['id_1', 'id_2']);
        expect(instance.handleResponse).toBeCalledTimes(1);
        expect(instance.handleResponse).toBeCalledWith(true);
        expect(instance.handleHide).not.toBeCalled();
        expect(wrapper.state('saving')).toEqual(true);

        wrapper.setState({saving: false, values: [{id: 'id_1'}, {id: 'id_2'}]});
        await wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(actions.addUsersToTeam).toBeCalled();
        expect(actions.addUsersToTeam).toHaveBeenCalledTimes(2);
        expect(actions.addUsersToTeam).toBeCalledWith('current_team_id', ['id_1', 'id_2']);
        expect(instance.handleResponse).toBeCalledTimes(2);
        expect(instance.handleResponse).lastCalledWith(undefined);
        expect(instance.handleHide).toBeCalledTimes(1);
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
        const getProfilesNotInTeam = jest.fn().mockResolvedValue({data: true});
        const actions = {...baseActions, getProfilesNotInTeam};
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
        const setModalSearchTerm = jest.fn().mockResolvedValue({data: true});
        const actions = {...baseActions, setModalSearchTerm};
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <AddUsersToTeam {...props}/>
        );

        wrapper.instance().search('');
        expect(actions.setModalSearchTerm).toHaveBeenCalledTimes(1);
        expect(actions.setModalSearchTerm).toBeCalledWith('');

        const searchTerm = 'term';
        wrapper.instance().search(searchTerm);
        expect(wrapper.state('loadingUsers')).toEqual(true);
        expect(actions.setModalSearchTerm).toHaveBeenCalledTimes(2);
        expect(actions.setModalSearchTerm).toBeCalledWith(searchTerm);
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

        const optionBot = {id: 'id', is_bot: true, last_picture_update: '12345'};
        expect(wrapper.instance().renderOption(optionBot, isSelected, onAdd)).toMatchSnapshot();
    });

    test('should match when renderValue is called', () => {
        const wrapper = shallow(
            <AddUsersToTeam {...baseProps}/>
        );

        expect(wrapper.instance().renderValue({data: {username: 'username'}})).toEqual('username');
    });
});
