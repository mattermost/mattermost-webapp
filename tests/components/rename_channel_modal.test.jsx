// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {RequestStatus} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import RenameChannelModal from 'components/rename_channel_modal/rename_channel_modal.jsx';

describe('components/RenameChannelModal', () => {
    global.window.mm_config = {};
    const channel = {
        id: 'fake-id',
        name: 'fake-channel',
        display_name: 'Fake Channel',
    };

    const team = {
        name: 'Fake Team', display_name: 'fake-team', type: 'O',
    };

    const baseProps = {
        show: true,
        onHide: jest.fn(),
        channel: {...channel},
        requestStatus: RequestStatus.NOT_STARTED,
        team: {...team},
        currentTeamUrl: 'fake-channel',
        actions: {updateChannel: jest.fn()},
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal {...baseProps}/>
        ).dive({disableLifecycleMethods: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('should submit form', () => {
        const {actions: {updateChannel}} = baseProps;
        const props = {...baseProps, requestStatus: RequestStatus.STARTED};
        const wrapper = shallowWithIntl(
            <RenameChannelModal {...props}/>
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#save-button').simulate('click');

        expect(updateChannel).not.toHaveBeenCalled();
    });

    test('should not call updateChannel as channel.name.length > Constants.MAX_CHANNELNAME_LENGTH (22)', () => {
        const {actions: {updateChannel}} = baseProps;
        const wrapper = shallowWithIntl(
            <RenameChannelModal {...baseProps}/>
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#display_name').simulate(
            'change', {preventDefault: jest.fn(), target: {value: 'string-above-twentytwo-characters'}}
        );

        wrapper.find('#save-button').simulate('click');

        expect(updateChannel).not.toHaveBeenCalled();
    });

    test('should change state when display_name is edited', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal {...baseProps}/>
        ).dive({disableLifecycleMethods: true});

        wrapper.find('#display_name').simulate(
            'change', {preventDefault: jest.fn(), target: {value: 'New Fake Channel'}}
        );

        expect(wrapper.state('displayName')).toBe('New Fake Channel');
    });

    test('should call componentWillReceiveProps', () => {
        const nextProps = {...baseProps, channel: {display_name: 'Changed Name', name: 'changed-name'}};
        const wrapper = shallowWithIntl(
            <RenameChannelModal {...baseProps}/>
        ).dive({disableLifecycleMethods: true});

        wrapper.setProps(nextProps);
        expect(wrapper.state('displayName')).toBe('Changed Name');
    });

    test('should call setError function', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal {...baseProps}/>
        ).dive({disableLifecycleMethods: true});

        const instance = wrapper.instance();

        instance.setError({message: 'This is an error message'});
        expect(wrapper.state('serverError')).toBe('This is an error message');
    });

    test('should call unsetError function', () => {
        const props = {...baseProps, serverError: {message: 'This is an error message'}};
        const wrapper = shallowWithIntl(
            <RenameChannelModal {...props}/>
        ).dive({disableLifecycleMethods: true});

        wrapper.setState({serverError: props.serverError.message});
        expect(wrapper.state('serverError')).toBe('This is an error message');

        wrapper.find('#save-button').simulate('click');
        expect(wrapper.state('serverError')).toBe('');
    });

    test('should call handleSubmit function', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal {...baseProps}/>
        ).dive({disableLifecycleMethods: true});

        wrapper.setState({displayName: 'Changed Name', channelName: 'changed-name'});

        const instance = wrapper.instance();
        instance.handleSubmit();

        expect(wrapper.state('displayName')).toBe('Changed Name');
        expect(wrapper.state('channelName')).toBe('changed-name');
    });

    test('should call handleCancel', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal {...baseProps}/>
        ).dive({disableLifecycleMethods: true});

        const instance = wrapper.instance();
        instance.handleCancel();

        expect(wrapper.state('show')).toBeFalsy();
    });

    test('should call handleHide function', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal {...baseProps}/>
        ).dive({disableLifecycleMethods: true});

        const instance = wrapper.instance();
        instance.handleHide();

        expect(wrapper.state('show')).toBeFalsy();
    });

    test('should call onNameChange function', () => {
        const changedName = {target: {value: 'changed-name'}};
        const wrapper = shallowWithIntl(
            <RenameChannelModal {...baseProps}/>
        ).dive({disableLifecycleMethods: true});

        const instance = wrapper.instance();
        instance.onNameChange(changedName);

        expect(wrapper.state('channelName')).toBe('changed-name');
    });
});
