// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {RequestStatus} from 'mattermost-redux/constants';
import {Channel} from 'mattermost-redux/types/channels';
import {Team} from 'mattermost-redux/types/teams';

import {defaultIntl, shallowWithIntl} from 'tests/helpers/intl-test-helper';

import {RenameChannelModal} from './rename_channel_modal';

describe('components/RenameChannelModal', () => {
    const channel: Channel = {
        id: 'fake-id',
        name: 'fake-channel',
        display_name: 'Fake Channel',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        team_id: '',
        type: 'O',
        header: '',
        purpose: 'string',
        last_post_at: 0,
        total_msg_count: 0,
        extra_update_at: 0,
        creator_id: '',
        scheme_id: '',
        isCurrent: false,
        teammate_id: '',
        status: '',
        fake: false,
        group_constrained: false,
    };

    const team: Team = {
        name: 'Fake Team',
        display_name: 'fake-team',
        type: 'O',
        id: '',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        description: '',
        email: '',
        company_name: '',
        allowed_domains: '',
        invite_id: '',
        allow_open_invite: false,
        scheme_id: '',
        group_constrained: false,
    };

    const baseProps = {
        show: true,
        onHide: jest.fn(),
        channel: {...channel},
        requestStatus: RequestStatus.NOT_STARTED,
        team: {...team},
        currentTeamUrl: 'fake-channel',
        actions: {patchChannel: jest.fn().mockResolvedValue({data: true})},
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                intl={defaultIntl}
                {...baseProps}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should submit form', () => {
        const {actions: {patchChannel}} = baseProps;
        const props = {...baseProps, requestStatus: RequestStatus.STARTED};
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                intl={defaultIntl}
                {...props}
            />,
        );

        wrapper.find('#display_name').simulate(
            'change', {preventDefault: jest.fn(), target: {value: 'valid name'}},
        );

        wrapper.find('#save-button').simulate('click');

        expect(patchChannel).toHaveBeenCalled();
    });

    describe('should validate channel url (name)', () => {
        const testCases : [{name: string, value: string}, boolean][] = [
            [{name: 'must be two or more characters', value: 'a'}, false],
            [{name: 'must start with a letter or number', value: '_channel'}, false],
            [{name: 'must end with a letter or number', value: 'channel_'}, false],
            [{name: 'can contain two underscores in a row', value: 'channel__two'}, true],
            [{name: 'can not resemble direct message channel url', value: 'uzsfmtmniifsjgesce4u7yznyh__uzsfmtmniifsjgesce4u7yznyh'}, false],
            [{name: 'valid channel url', value: 'a_valid_channel'}, true],
        ];

        testCases.forEach(([testCaseProps, patchShouldHaveBeenCalled]) => {
            it(testCaseProps.name, () => {
                const {actions: {patchChannel}} = baseProps;
                const wrapper = shallowWithIntl(
                    <RenameChannelModal
                        intl={defaultIntl}
                        {...baseProps}
                    />,
                );

                wrapper.setState({channelName: testCaseProps.value});

                wrapper.find('#save-button').simulate('click');
                if (patchShouldHaveBeenCalled) {
                    expect(patchChannel).toHaveBeenCalled();
                } else {
                    expect(patchChannel).not.toHaveBeenCalled();
                }
            });
        });
    });

    test('should not call patchChannel as channel.name.length > Constants.MAX_CHANNELNAME_LENGTH (64)', () => {
        const {actions: {patchChannel}} = baseProps;
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                intl={defaultIntl}
                {...baseProps}
            />,
        );

        wrapper.find('#display_name').simulate(
            'change', {preventDefault: jest.fn(), target: {value: 'string-above-sixtyfour-characters-to-test-the-channel-maxlength-limit-properly-in-the-component'}},
        );

        wrapper.find('#save-button').simulate('click');

        expect(patchChannel).not.toHaveBeenCalled();
    });

    test('should change state when display_name is edited', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                intl={defaultIntl}
                {...baseProps}
            />,
        );

        wrapper.find('#display_name').simulate(
            'change', {preventDefault: jest.fn(), target: {value: 'New Fake Channel'}},
        );

        expect(wrapper.state('displayName')).toBe('New Fake Channel');
    });

    test('should call setError function', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                intl={defaultIntl}
                {...baseProps}
            />,
        );

        const instance = wrapper.instance() as RenameChannelModal;

        instance.setError({message: 'This is an error message'});
        expect(wrapper.state('serverError')).toBe('This is an error message');
    });

    test('should call unsetError function', () => {
        const props = {...baseProps, serverError: {message: 'This is an error message'}};
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                intl={defaultIntl}
                {...props}
            />,
        );

        wrapper.setState({serverError: props.serverError.message});
        expect(wrapper.state('serverError')).toBe('This is an error message');

        wrapper.find('#save-button').simulate('click');
        expect(wrapper.state('serverError')).toBe('');
    });

    test('should call handleSubmit function', async () => {
        const patchChannel = jest.fn().
            mockResolvedValueOnce({error: true}).
            mockResolvedValue({data: true});

        const wrapper = shallowWithIntl(
            <RenameChannelModal
                intl={defaultIntl}
                {...baseProps}
                actions={{patchChannel}}
            />,
        );

        wrapper.setState({displayName: 'Changed Name', channelName: 'changed-name'});

        const instance = wrapper.instance() as RenameChannelModal;
        instance.onSaveSuccess = jest.fn();
        instance.setError = jest.fn();

        await instance.handleSubmit();
        expect(patchChannel).toHaveBeenCalledTimes(1);
        expect(wrapper.state('displayName')).toBe('Changed Name');
        expect(wrapper.state('channelName')).toBe('changed-name');
        expect(instance.onSaveSuccess).not.toBeCalled();
        expect(instance.setError).toBeCalledTimes(1);
        expect(instance.setError).toBeCalledWith(true);

        await instance.handleSubmit();
        expect(patchChannel).toHaveBeenCalledTimes(2);
        expect(wrapper.state('displayName')).toBe('Changed Name');
        expect(wrapper.state('channelName')).toBe('changed-name');
        expect(instance.onSaveSuccess).toBeCalledTimes(1);
        expect(instance.setError).toBeCalledTimes(1);
    });

    test('should call handleCancel', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                intl={defaultIntl}
                {...baseProps}
            />,
        );

        const instance = wrapper.instance() as RenameChannelModal;
        instance.handleCancel();

        expect(wrapper.state('show')).toBeFalsy();
    });

    test('should call handleHide function', () => {
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                intl={defaultIntl}
                {...baseProps}
            />,
        );

        const instance = wrapper.instance() as RenameChannelModal;
        instance.handleHide();

        expect(wrapper.state('show')).toBeFalsy();
    });

    test('should call onNameChange function', () => {
        const changedName = {target: {value: 'changed-name'}};
        const wrapper = shallowWithIntl(
            <RenameChannelModal
                intl={defaultIntl}
                {...baseProps}
            />,
        );

        const instance = wrapper.instance() as RenameChannelModal;
        instance.onNameChange(changedName);

        expect(wrapper.state('channelName')).toBe('changed-name');
    });
});
