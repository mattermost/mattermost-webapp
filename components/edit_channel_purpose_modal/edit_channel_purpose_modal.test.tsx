// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {Channel} from 'mattermost-redux/types/channels';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import {testComponentForLineBreak} from 'tests/helpers/line_break_helpers';
import EditChannelPurposeModal, {EditChannelPurposeModal as EditChannelPurposeModalClass} from 'components/edit_channel_purpose_modal/edit_channel_purpose_modal';
import Constants from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

describe('comoponents/EditChannelPurposeModal', () => {
    const channel = TestHelper.getChannelMock({
        purpose: 'testPurpose',
    });

    it('should match on init', () => {
        const wrapper = shallowWithIntl(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={true}
                onHide={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true},
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match with display name', () => {
        const channelWithDisplayName = {
            ...channel,
            display_name: 'channel name',
        };

        const wrapper = shallowWithIntl(
            <EditChannelPurposeModal
                channel={channelWithDisplayName}
                ctrlSend={true}
                onHide={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true},
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match for private channel', () => {
        const privateChannel: Channel = {
            ...channel,
            type: 'P',
        };

        const wrapper = shallowWithIntl(
            <EditChannelPurposeModal
                channel={privateChannel}
                ctrlSend={true}
                onHide={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true},
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match submitted', () => {
        const wrapper = shallowWithIntl(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={true}
                onHide={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true},
        ).dive();

        expect(wrapper).toMatchSnapshot();
    });

    it('match with modal error', async () => {
        const serverError = {
            id: 'api.context.invalid_param.app_error',
            message: 'error',
        };

        const wrapper = shallowWithIntl(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={false}
                onHide={jest.fn()}
                actions={{patchChannel: jest.fn().mockResolvedValue({error: serverError})}}
            />,
            {disableLifecycleMethods: true},
        );

        const instance = wrapper.instance() as EditChannelPurposeModalClass;
        await instance.handleSave();

        expect(wrapper).toMatchSnapshot();
    });

    it('match with modal error with fake id', async () => {
        const serverError = {
            id: 'fake-error-id',
            message: 'error',
        };

        const wrapper = shallowWithIntl(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={false}
                onHide={jest.fn()}
                actions={{patchChannel: jest.fn().mockResolvedValue({error: serverError})}}
            />,
            {disableLifecycleMethods: true},
        );

        const instance = wrapper.instance() as EditChannelPurposeModalClass;
        await instance.handleSave();

        expect(wrapper).toMatchSnapshot();
    });

    it('clear error on next', async () => {
        const wrapper = shallowWithIntl(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={false}
                onHide={jest.fn()}
                actions={{patchChannel: jest.fn().mockResolvedValue({data: true})}}
            />,
            {disableLifecycleMethods: true},
        );

        const serverError = {
            id: 'fake-error-id',
            message: 'error',
        };
        const instance = wrapper.instance();
        instance.setState({serverError});

        expect(wrapper).toMatchSnapshot();
    });

    it('update purpose state', () => {
        const wrapper = shallowWithIntl(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={true}
                onHide={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true},
        );

        wrapper.find('textarea').simulate(
            'change',
            {
                preventDefault: jest.fn(),
                target: {value: 'new info'},
            },
        );

        expect(wrapper.state('purpose')).toBe('new info');
    });

    it('hide on success', async () => {
        const wrapper = shallowWithIntl(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={true}
                onHide={jest.fn()}
                actions={{patchChannel: jest.fn().mockResolvedValue({data: true})}}
            />,
            {disableLifecycleMethods: true},
        );
        const instance = wrapper.instance() as EditChannelPurposeModalClass;
        await instance.handleSave();

        expect(wrapper.state('show')).toBeFalsy();
    });

    it('submit on save button click', () => {
        const patchChannel = jest.fn().mockResolvedValue({data: true});

        const wrapper = shallowWithIntl(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={true}
                onHide={jest.fn()}
                actions={{patchChannel}}
            />,
            {disableLifecycleMethods: true},
        );

        wrapper.find('.save-button').simulate('click');

        expect(patchChannel).toBeCalledWith('channel_id', {purpose: 'testPurpose'});
    });

    it('submit on ctrl + enter', () => {
        const patchChannel = jest.fn().mockResolvedValue({data: true});

        const wrapper = shallowWithIntl(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={true}
                onHide={jest.fn()}
                actions={{patchChannel}}
            />,
            {disableLifecycleMethods: true},
        );

        wrapper.find('textarea').simulate('keydown', {
            preventDefault: jest.fn(),
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            ctrlKey: true,
        });

        expect(patchChannel).toBeCalledWith('channel_id', {purpose: 'testPurpose'});
    });

    it('submit on enter', () => {
        const patchChannel = jest.fn().mockResolvedValue({data: true});

        const wrapper = shallowWithIntl(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={false}
                onHide={jest.fn()}
                actions={{patchChannel}}
            />,
            {disableLifecycleMethods: true},
        );

        wrapper.find('textarea').simulate('keydown', {
            preventDefault: jest.fn(),
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            ctrlKey: false,
        });

        expect(patchChannel).toBeCalledWith('channel_id', {purpose: 'testPurpose'});
    });

    testComponentForLineBreak((value: string) => (
        <EditChannelPurposeModal
            channel={{
                ...channel,
                purpose: value,
            }}
            ctrlSend={true}
            onHide={jest.fn()}
            actions={{patchChannel: jest.fn()}}
        />
    ), (instance: EditChannelPurposeModalClass) => instance.state.purpose);
});
