// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {RequestStatus} from 'mattermost-redux/constants';
import {shallow} from 'enzyme';

import EditChannelPurposeModal from 'components/edit_channel_purpose_modal/edit_channel_purpose_modal.jsx';
import Constants from 'utils/constants.jsx';

describe('comoponents/EditChannelPurposeModal', () => {
    const channel = {
        id: 'fake-id',
        purpose: 'purpose',
    };

    it('should match on init', () => {
        const wrapper = shallow(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={true}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={jest.fn()}
                onModalDismissed={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true}
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match with display name', () => {
        const channelWithDisplayName = {
            ...channel,
            display_name: 'channel name',
        };

        const wrapper = shallow(
            <EditChannelPurposeModal
                channel={channelWithDisplayName}
                ctrlSend={true}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={jest.fn()}
                onModalDismissed={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true}
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match for private channel', () => {
        const privateChannel = {
            ...channel,
            type: 'P',
        };

        const wrapper = shallow(
            <EditChannelPurposeModal
                channel={privateChannel}
                ctrlSend={true}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={jest.fn()}
                onModalDismissed={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true}
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match submitted', () => {
        const wrapper = shallow(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={true}
                requestStatus={RequestStatus.STARTED}
                onHide={jest.fn()}
                onModalDismissed={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true}
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('match with modal error', () => {
        const wrapper = shallow(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.STARTED}
                onHide={jest.fn()}
                onModalDismissed={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true}
        );

        const serverError = {
            id: 'api.context.invalid_param.app_error',
            message: 'error',
        };

        wrapper.setProps({
            channel,
            serverError,
            ctrlSend: false,
            requestStatus: RequestStatus.FAILURE,
            onModalDismissed: jest.fn(),
            actions: {patchChannel: jest.fn()},
        });

        expect(wrapper).toMatchSnapshot();
    });

    it('match with modal error with fake id', () => {
        const wrapper = shallow(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.STARTED}
                onHide={jest.fn()}
                onModalDismissed={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true}
        );

        const serverError = {
            id: 'fake-error-id',
            message: 'error',
        };

        wrapper.setProps({
            channel,
            serverError,
            ctrlSend: false,
            requestStatus: RequestStatus.FAILURE,
            onHide: jest.fn(),
            onModalDismissed: jest.fn(),
            actions: {patchChannel: jest.fn()},
        });

        expect(wrapper).toMatchSnapshot();
    });

    it('clear error on next', () => {
        const wrapper = shallow(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.STARTED}
                onHide={jest.fn()}
                onModalDismissed={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true}
        );

        const serverError = {
            id: 'fake-error-id',
            message: 'error',
        };

        wrapper.setProps({
            channel,
            serverError,
            ctrlSend: false,
            requestStatus: RequestStatus.FAILURE,
            onHide: jest.fn(),
            onModalDismissed: jest.fn(),
            actions: {patchChannel: jest.fn()},
        });

        wrapper.setProps({
            channel,
            serverError,
            ctrlSend: false,
            requestStatus: RequestStatus.STARTED,
            onHide: jest.fn(),
            onModalDismissed: jest.fn(),
            actions: {patchChannel: jest.fn()},
        });

        expect(wrapper).toMatchSnapshot();
    });

    it('update purpose state', () => {
        const wrapper = shallow(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={true}
                requestStatus={RequestStatus.STARTED}
                onHide={jest.fn()}
                onModalDismissed={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true}
        );

        wrapper.find('textarea').simulate(
            'change',
            {
                preventDefault: jest.fn(),
                target: {value: 'new info'},
            }
        );

        expect(wrapper.state('purpose')).toBe('new info');
    });

    it('hide on success', () => {
        const wrapper = shallow(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={true}
                requestStatus={RequestStatus.STARTED}
                onHide={jest.fn()}
                onModalDismissed={jest.fn()}
                actions={{patchChannel: jest.fn()}}
            />,
            {disableLifecycleMethods: true}
        );

        wrapper.setProps({
            channel,
            ctrlSend: false,
            requestStatus: RequestStatus.SUCCESS,
            onHide: jest.fn(),
            onModalDismissed: jest.fn(),
            actions: {patchChannel: jest.fn()},
        });

        expect(wrapper.state('show')).toBeFalsy();
    });

    it('submit on save button click', () => {
        const patchChannel = jest.fn();

        const wrapper = shallow(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={true}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={jest.fn()}
                onModalDismissed={jest.fn()}
                actions={{patchChannel}}
            />,
            {disableLifecycleMethods: true}
        );

        wrapper.find('.save-button').simulate('click');

        expect(patchChannel).toBeCalledWith('fake-id', {purpose: 'purpose'});
    });

    it('submit on ctrl + enter', () => {
        const patchChannel = jest.fn();

        const wrapper = shallow(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={true}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={jest.fn()}
                onModalDismissed={jest.fn()}
                actions={{patchChannel}}
            />,
            {disableLifecycleMethods: true}
        );

        wrapper.find('textarea').simulate('keydown', {
            preventDefault: jest.fn(),
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            ctrlKey: true,
        });

        expect(patchChannel).toBeCalledWith('fake-id', {purpose: 'purpose'});
    });

    it('submit on enter', () => {
        const patchChannel = jest.fn();

        const wrapper = shallow(
            <EditChannelPurposeModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={jest.fn()}
                onModalDismissed={jest.fn()}
                actions={{patchChannel}}
            />,
            {disableLifecycleMethods: true}
        );

        wrapper.find('textarea').simulate('keydown', {
            preventDefault: jest.fn(),
            key: Constants.KeyCodes.ENTER[0],
            keyCode: Constants.KeyCodes.ENTER[1],
            ctrlKey: false,
        });

        expect(patchChannel).toBeCalledWith('fake-id', {purpose: 'purpose'});
    });
});
