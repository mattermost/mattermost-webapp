// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {RequestStatus} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import Constants from 'utils/constants.jsx';
import EditChannelHeaderModal from 'components/edit_channel_header_modal/edit_channel_header_modal.jsx';

describe('components/edit_channel_header_modal/edit_channel_header_modal', () => {
    const channel = {
        id: 'fake-id',
        header: 'Fake Channel'
    };

    function emptyFunction() {} //eslint-disable-line no-empty-function

    test('should match snapshot, init', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                onPatchChannel={emptyFunction}
            />
        ).dive({disableLifecycleMethods: true});
        expect(wrapper).toMatchSnapshot();
    });
    test('edit dirrect message channel', () => {
        const dmChannel = {
            ...channel,
            type: Constants.DM_CHANNEL
        };

        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={dmChannel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                onPatchChannel={emptyFunction}
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
                onPatchChannel={emptyFunction}
            />
        ).dive({disableLifecycleMethods: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('error with intl message', () => {
        const serverError = {
            server_error_id: 'model.channel.is_valid.header.app_error',
            message: 'some error'
        };

        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                onPatchChannel={emptyFunction}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.setProps({
            channel,
            serverError,
            ctrSend: false,
            requestStatus: RequestStatus.FAILURE,
            onHide: emptyFunction,
            onPatchChannel: emptyFunction
        });

        expect(wrapper).toMatchSnapshot();
    });

    test('error without intl message', () => {
        const serverError = {
            server_error_id: 'fake-server-errror',
            message: 'some error'
        };

        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                onPatchChannel={emptyFunction}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.setProps({
            channel,
            serverError,
            ctrSend: false,
            requestStatus: RequestStatus.FAILURE,
            onHide: emptyFunction,
            onPatchChannel: emptyFunction
        });

        expect(wrapper).toMatchSnapshot();
    });

    test('patch on save button click', () => {
        const patchChannel = jest.fn();
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                channel={channel}
                ctrlSend={false}
                requestStatus={RequestStatus.NOT_STARTED}
                onHide={emptyFunction}
                onPatchChannel={patchChannel}
            />
        ).dive({disableLifecycleMethods: true});

        wrapper.find('.save-button').simulate('click');

        expect(patchChannel.mock.calls.length).toBe(1);
        expect(patchChannel.mock.calls[0][0]).toBe('fake-id', {header: 'Fake Channel'});
    });
});

