// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import {testComponentForLineBreak} from 'tests/helpers/line_break_helpers';

import Constants from 'utils/constants';
import EditChannelHeaderModal from 'components/edit_channel_header_modal/edit_channel_header_modal.jsx';
import Textbox from 'components/textbox';

const KeyCodes = Constants.KeyCodes;

describe('components/EditChannelHeaderModal', () => {
    const channel = {
        id: 'fake-id',
        header: 'Fake Channel',
    };

    const serverError = {
        server_error_id: 'fake-server-error',
        message: 'some error',
    };

    const baseProps = {
        channel,
        ctrlSend: false,
        show: false,
        shouldShowPreview: false,
        actions: {
            closeModal: jest.fn(),
            setShowPreview: jest.fn(),
            patchChannel: jest.fn().mockResolvedValueOnce({error: serverError}).mockResolvedValue({}),
        },
    };

    test('should match snapshot, init', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
    test('edit direct message channel', () => {
        const dmChannel = {
            ...channel,
            type: Constants.DM_CHANNEL,
        };

        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                {...baseProps}
                channel={dmChannel}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('submitted', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        wrapper.setState({saving: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('error with intl message', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        wrapper.setState({serverError: {...serverError, server_error_id: 'model.channel.is_valid.header.app_error'}});
        expect(wrapper).toMatchSnapshot();
    });

    test('error without intl message', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        wrapper.setState({serverError});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state and called actions on handleSave', async () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        const instance = wrapper.instance();

        // on no change, should hide the modal without trying to patch a channel
        await instance.handleSave();
        expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.patchChannel).toHaveBeenCalledTimes(0);

        // on error, should not close modal and set server error state
        wrapper.setState({header: 'New header'});
        await wrapper.instance().handleSave();
        expect(baseProps.actions.patchChannel).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(1);
        expect(wrapper.state('serverError')).toBe(serverError);

        // on success, should close modal
        await wrapper.instance().handleSave();
        expect(baseProps.actions.patchChannel).toHaveBeenCalledTimes(2);
        expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(2);
    });

    test('change header', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        wrapper.find(Textbox).simulate('change', {target: {value: 'header'}});

        expect(
            wrapper.state('header'),
        ).toBe('header');
    });

    test('patch on save button click', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        const newHeader = 'New channel header';
        wrapper.setState({header: newHeader});
        wrapper.find('.save-button').simulate('click');

        expect(baseProps.actions.patchChannel).toBeCalledWith('fake-id', {header: newHeader});
    });

    test('patch on enter keypress event with ctrl', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                {...baseProps}
                ctrlSend={true}
            />,
        );

        const newHeader = 'New channel header';
        wrapper.setState({header: newHeader});
        wrapper.find(Textbox).simulate('keypress', {
            preventDefault: jest.fn(),
            key: KeyCodes.ENTER[0],
            which: KeyCodes.ENTER[1],
            shiftKey: false,
            altKey: false,
            ctrlKey: true,
        });

        expect(baseProps.actions.patchChannel).toBeCalledWith('fake-id', {header: newHeader});
    });

    test('patch on enter keypress', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        const newHeader = 'New channel header';
        wrapper.setState({header: newHeader});
        wrapper.find(Textbox).simulate('keypress', {
            preventDefault: jest.fn(),
            key: KeyCodes.ENTER[0],
            which: KeyCodes.ENTER[1],
            shiftKey: false,
            altKey: false,
            ctrlKey: false,
        });

        expect(baseProps.actions.patchChannel).toBeCalledWith('fake-id', {header: newHeader});
    });

    test('patch on enter keydown', () => {
        const wrapper = shallowWithIntl(
            <EditChannelHeaderModal
                {...baseProps}
                ctrlSend={true}
            />,
        );

        const newHeader = 'New channel header';
        wrapper.setState({header: newHeader});
        wrapper.find(Textbox).simulate('keydown', {
            preventDefault: jest.fn(),
            key: KeyCodes.ENTER[0],
            keyCode: KeyCodes.ENTER[1],
            which: KeyCodes.ENTER[1],
            shiftKey: false,
            altKey: false,
            ctrlKey: true,
        });

        expect(baseProps.actions.patchChannel).toBeCalledWith('fake-id', {header: newHeader});
    });

    testComponentForLineBreak((value) => (
        <EditChannelHeaderModal
            {...baseProps}
            channel={{
                ...baseProps.channel,
                header: value,
            }}
        />
    ), (instance) => instance.state().header);
});
