// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AddGroupsToChannelModal from 'components/add_groups_to_channel_modal/add_groups_to_channel_modal.jsx';

describe('components/AddGroupsToChannelModal', () => {
    const baseProps = {
        currentChannelName: 'foo',
        currentChannelId: '123',
        teamID: '456',
        searchTerm: '',
        groups: [],
        onHide: () => { },
        actions: {
            getGroupsNotAssociatedToChannel: jest.fn().mockResolvedValue({data: true}),
            setModalSearchTerm: jest.fn().mockResolvedValue({data: true}),
            linkGroupSyncable: jest.fn().mockResolvedValue({data: true, error: null}),
            getAllGroupsAssociatedToChannel: jest.fn().mockResolvedValue({data: true}),
            getTeam: jest.fn().mockResolvedValue({data: true}),
            getAllGroupsAssociatedToTeam: jest.fn().mockResolvedValue({data: true}),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <AddGroupsToChannelModal {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should have called onHide when handleExit is called', () => {
        const onHide = jest.fn();
        const props = {...baseProps, onHide};
        const wrapper = shallow(
            <AddGroupsToChannelModal {...props}/>,
        );

        wrapper.instance().handleExit();
        expect(onHide).toHaveBeenCalledTimes(1);
    });

    test('should match state when handleResponse is called', () => {
        const wrapper = shallow(
            <AddGroupsToChannelModal {...baseProps}/>,
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

    /*test('should match state when handleSubmit is called', async () => {
        const linkGroupSyncable = jest.fn().
            mockResolvedValueOnce({error: true}).
            mockResolvedValue({data: true});
        const actions = {...baseProps.actions, linkGroupSyncable};
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <AddGroupsToChannelModal {...props}/>
        );
        const instance = wrapper.instance();
        instance.handleResponse = jest.fn();
        instance.handleHide = jest.fn();

        wrapper.setState({values: []});
        await wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(actions.linkGroupSyncable).not.toBeCalled();

        wrapper.setState({saving: false, values: [{id: 'id_1'}, {id: 'id_2'}]});
        await wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(actions.linkGroupSyncable).toBeCalled();
        expect(actions.linkGroupSyncable).toHaveBeenCalledTimes(2);
        expect(actions.linkGroupSyncable).toBeCalledWith('id_1', baseProps.currentChannelId, Groups.SYNCABLE_TYPE_CHANNEL, {auto_add: true});
        expect(actions.linkGroupSyncable).toBeCalledWith('id_2', baseProps.currentChannelId, Groups.SYNCABLE_TYPE_CHANNEL, {auto_add: true});

        setTimeout(() => {
            expect(instance.handleResponse).toBeCalledTimes(2);
        }, 0);
        expect(instance.handleHide).not.toBeCalled();
        expect(wrapper.state('saving')).toEqual(true);
    });*/

    test('should match state when addValue is called', () => {
        const wrapper = shallow(
            <AddGroupsToChannelModal {...baseProps}/>,
        );
        const value1 = {id: 'id_1', label: 'label_1', value: 'value_1'};
        const value2 = {id: 'id_2', label: 'label_2', value: 'value_2'};

        wrapper.setState({values: [value1]});
        wrapper.instance().addValue(value2);
        expect(wrapper.state('values')).toEqual([value1, value2]);

        wrapper.setState({values: [value1]});
        wrapper.instance().addValue(value1);
        expect(wrapper.state('values')).toEqual([value1]);
    });

    test('should match state when handlePageChange is called', () => {
        const wrapper = shallow(
            <AddGroupsToChannelModal {...baseProps}/>,
        );

        wrapper.setState({users: [{id: 'id_1'}]});
        wrapper.instance().handlePageChange(0, 1);
        expect(baseProps.actions.getGroupsNotAssociatedToChannel).toHaveBeenCalledTimes(1);

        wrapper.instance().handlePageChange(1, 0);
        expect(baseProps.actions.getGroupsNotAssociatedToChannel).toHaveBeenCalledTimes(2);

        wrapper.instance().handlePageChange(0, 1);
        expect(baseProps.actions.getGroupsNotAssociatedToChannel).toHaveBeenCalledTimes(2);
    });

    test('should match state when search is called', () => {
        const wrapper = shallow(
            <AddGroupsToChannelModal {...baseProps}/>,
        );

        wrapper.instance().search('');
        expect(baseProps.actions.setModalSearchTerm).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.setModalSearchTerm).toBeCalledWith('');

        const searchTerm = 'term';
        wrapper.instance().search(searchTerm);
        expect(wrapper.state('loadingGroups')).toEqual(true);
        expect(baseProps.actions.setModalSearchTerm).toHaveBeenCalledTimes(2);
        expect(baseProps.actions.setModalSearchTerm).toBeCalledWith(searchTerm);
    });

    test('should match state when handleDelete is called', () => {
        const wrapper = shallow(
            <AddGroupsToChannelModal {...baseProps}/>,
        );

        const value1 = {id: 'id_1', label: 'label_1', value: 'value_1'};
        const value2 = {id: 'id_2', label: 'label_2', value: 'value_2'};
        const value3 = {id: 'id_3', label: 'label_3', value: 'value_3'};

        wrapper.setState({values: [value1]});
        const newValues = [value2, value3];
        wrapper.instance().handleDelete(newValues);
        expect(wrapper.state('values')).toEqual(newValues);
    });

    test('should match when renderOption is called', () => {
        const wrapper = shallow(
            <AddGroupsToChannelModal {...baseProps}/>,
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
            <AddGroupsToChannelModal {...baseProps}/>,
        );

        expect(wrapper.instance().renderValue({data: {display_name: 'foo'}})).toEqual('foo');
    });
});
