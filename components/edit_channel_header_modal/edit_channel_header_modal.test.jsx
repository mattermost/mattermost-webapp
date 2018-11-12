// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {RequestStatus} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import Constants from 'utils/constants.jsx';
import EditChannelHeaderModal from 'components/edit_channel_header_modal/edit_channel_header_modal.jsx';
import Textbox from 'components/textbox';

const KeyCodes = Constants.KeyCodes;

jest.mock('react-dom', () => ({
    findDOMNode: () => ({
        blur: jest.fn(),
    }),
}));

describe('components/EditChannelHeaderModal', () => {
    const channel = {
        id: 'fake-id',
        header: 'Fake Channel',
    };

    function emptyFunction() {} //eslint-disable-line no-empty-function

    test('should match snapshot, init', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                actions={{patchChannel: emptyFunction}}
            />
        ).dive({disableLifecycleMethods: true});
        expect(wrapper).toMatchSnapshot();
    });
    test('edit dirrect message channel', () => {
        const dmChannel = {
            ...channel,
            type: Constants.DM_CHANNEL,
        };

        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={dmChannel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                actions={{patchChannel: emptyFunction}}
            />
        ).dive({disableLifecycleMethods: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('submitted', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.STARTED}
                onHide={emptyFunction}
                actions={{patchChannel: emptyFunction}}
            />
        ).dive({disableLifecycleMethods: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('error with intl message', () => {
        const serverError = {
            server_error_id: 'model.channel.is_valid.header.app_error',
            message: 'some error',
        };

        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                actions={{patchChannel: emptyFunction}}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.setProps({
            channel,
            serverError,
            ctrSend: false,
            requestStatus: RequestStatus.FAILURE,
            onHide: emptyFunction,
            actions: {patchChannel: emptyFunction},
        });

        expect(wrapper).toMatchSnapshot();
    });

    test('error without intl message', () => {
        const serverError = {
            server_error_id: 'fake-server-errror',
            message: 'some error',
        };

        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                actions={{patchChannel: emptyFunction}}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.setProps({
            channel,
            serverError,
            ctrSend: false,
            requestStatus: RequestStatus.FAILURE,
            onHide: emptyFunction,
            actions: {patchChannel: emptyFunction},
        });

        expect(wrapper).toMatchSnapshot();
    });

    test('hide error message on new request', () => {
        const serverError = {
            server_error_id: 'fake-server-errror',
            message: 'some error',
        };

        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                actions={{patchChannel: emptyFunction}}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.setProps({
            channel,
            serverError,
            ctrSend: false,
            requestStatus: RequestStatus.FAILURE,
            onHide: emptyFunction,
            actions: {patchChannel: emptyFunction},
        });
        wrapper.setProps({
            channel,
            serverError,
            ctrSend: false,
            requestStatus: RequestStatus.STARTED,
            onHide: emptyFunction,
            actions: {patchChannel: emptyFunction},
        });

        expect(wrapper).toMatchSnapshot();
    });

    test('hide on requestsStatus changed to success', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.STARTED}
                onHide={emptyFunction}
                actions={{patchChannel: emptyFunction}}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.setProps({
            channel,
            ctrSend: false,
            requestStatus: RequestStatus.SUCCESS,
            onHide: emptyFunction,
            actions: {patchChannel: emptyFunction},
        });

        expect(
            wrapper.state('show')
        ).toBeFalsy();
    });

    test('change header', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                actions={{patchChannel: emptyFunction}}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find(Textbox).simulate('change', {target: {value: 'header'}});

        expect(
            wrapper.state('header')
        ).toBe('header');
    });

    test('patch on save button click', () => {
        const patchChannel = jest.fn();
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                actions={{patchChannel}}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('.save-button').simulate('click');

        expect(patchChannel).toBeCalledWith('fake-id', {header: 'Fake Channel'});
    });

    test('patch on enter keypress event with ctrl', () => {
        const patchChannel = jest.fn();
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={true}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                actions={{patchChannel}}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find(Textbox).simulate('keypress', {
            preventDefault: emptyFunction,
            key: KeyCodes.ENTER[0],
            which: KeyCodes.ENTER[1],
            shiftKey: false,
            altKey: false,
            ctrlKey: true,
        });

        expect(patchChannel).toBeCalledWith('fake-id', {header: 'Fake Channel'});
    });

    test('patch on enter keypress', () => {
        const patchChannel = jest.fn();
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                actions={{patchChannel}}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find(Textbox).simulate('keypress', {
            preventDefault: emptyFunction,
            key: KeyCodes.ENTER[0],
            which: KeyCodes.ENTER[1],
            shiftKey: false,
            altKey: false,
            ctrlKey: false,
        });

        expect(patchChannel).toBeCalledWith('fake-id', {header: 'Fake Channel'});
    });

    test('patch on enter keydown', () => {
        const patchChannel = jest.fn();
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={true}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                actions={{patchChannel}}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find(Textbox).simulate('keydown', {
            preventDefault: emptyFunction,
            key: KeyCodes.ENTER[0],
            keyCode: KeyCodes.ENTER[1],
            which: KeyCodes.ENTER[1],
            shiftKey: false,
            altKey: false,
            ctrlKey: true,
        });

        expect(patchChannel).toBeCalledWith('fake-id', {header: 'Fake Channel'});
    });
});
