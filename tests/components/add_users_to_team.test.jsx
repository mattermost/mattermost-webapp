// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {shallow} from 'enzyme';

import AddUsersToTeam from 'components/add_users_to_team/add_users_to_team.jsx';

jest.useFakeTimers();

jest.mock('actions/status_actions.jsx', () => ({
    loadStatusesForProfilesList: jest.fn(),
}));

describe('components/AddUsersToTeam', () => {
    const baseProps = {
        currentTeamId: 'current_team_id',
        currentTeamName: 'display_name',
        searchTerm: '',
        users: [{id: 'someid', username: 'somename', email: 'someemail'}],
        onModalDismissed: jest.fn(),
        actions: {
            getProfilesNotInTeam: jest.fn(() => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
            setModalSearchTerm: jest.fn(() => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
            searchProfiles: jest.fn(() => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
            addUsersToTeam: jest.fn(() => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
        },
    };

    test('should match snapshot', () => {
        const actions = {
            ...baseProps.actions,
            getProfilesNotInTeam: jest.fn(() => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
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
        const actions = {
            ...baseProps.actions,
            addUsersToTeam: jest.fn(() => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
        };
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <AddUsersToTeam {...props}/>
        );

        wrapper.setState({values: []});
        wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(actions.addUsersToTeam).not.toBeCalled();

        wrapper.setState({saving: false, values: [{id: 'id_1'}, {id: 'id_2'}]});
        wrapper.instance().handleSubmit({preventDefault: jest.fn()});

        expect(actions.addUsersToTeam).toBeCalled();
        expect(actions.addUsersToTeam).toHaveBeenCalledTimes(1);
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
            ...baseProps.actions,
            getProfilesNotInTeam: jest.fn(() => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
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
        const actions = {
            ...baseProps.actions,
            setModalSearchTerm: jest.fn(() => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }),
        };
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <AddUsersToTeam {...props}/>
        );

        wrapper.instance().search('');
        jest.runAllTimers();
        expect(actions.setModalSearchTerm).toBeCalled();

        const searchTerm = 'term';
        wrapper.instance().search(searchTerm);
        expect(wrapper.state('loadingUsers')).toEqual(true);
        jest.runAllTimers();
        expect(actions.setModalSearchTerm).toHaveBeenCalledTimes(2);
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
