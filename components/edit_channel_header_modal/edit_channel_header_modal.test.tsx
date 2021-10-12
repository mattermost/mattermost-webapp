// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {Channel, ChannelType} from 'mattermost-redux/types/channels';

import {testComponentForLineBreak} from 'tests/helpers/line_break_helpers';

import Constants from 'utils/constants';
import EditChannelHeaderModal, {default as EditChannelHeaderModalClass} from 'components/edit_channel_header_modal/edit_channel_header_modal';
import Textbox from 'components/textbox';
import * as Utils from 'utils/utils.jsx';

const KeyCodes = Constants.KeyCodes;

describe('components/EditChannelHeaderModal', () => {
    const timestamp = Utils.getTimestamp();
    const channel = {
        id: 'fake-id',
        create_at: timestamp,
        update_at: timestamp,
        delete_at: timestamp,
        team_id: 'fake-team-id',
        type: Constants.OPEN_CHANNEL as ChannelType,
        display_name: 'Fake Channel',
        name: 'Fake Channel',
        header: 'Fake Channel',
        purpose: 'purpose',
        last_post_at: timestamp,
        creator_id: 'fake-creator-id',
        scheme_id: 'fake-scheme-id',
        group_constrained: false,
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
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
    test('edit direct message channel', () => {
        const dmChannel: Channel = {
            ...channel,
            type: Constants.DM_CHANNEL as ChannelType,
        };

        const wrapper = shallow(
            <EditChannelHeaderModal
                {...baseProps}
                channel={dmChannel}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('submitted', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        wrapper.setState({saving: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('error with intl message', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        wrapper.setState({serverError: {...serverError, server_error_id: 'model.channel.is_valid.header.app_error'}});
        expect(wrapper).toMatchSnapshot();
    });

    test('error without intl message', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        wrapper.setState({serverError});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state and called actions on handleSave', async () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        const instance = wrapper.instance() as EditChannelHeaderModalClass;

        // on no change, should hide the modal without trying to patch a channel
        await instance.handleSave();
        expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.patchChannel).toHaveBeenCalledTimes(0);

        // on error, should not close modal and set server error state
        wrapper.setState({header: 'New header'});

        await instance.handleSave();
        expect(baseProps.actions.patchChannel).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(1);
        expect(wrapper.state('serverError')).toBe(serverError);

        // on success, should close modal
        await instance.handleSave();
        expect(baseProps.actions.patchChannel).toHaveBeenCalledTimes(2);
        expect(baseProps.actions.closeModal).toHaveBeenCalledTimes(2);
    });

    test('change header', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        wrapper.find(Textbox).simulate('change', {target: {value: 'header'}});

        expect(
            wrapper.state('header'),
        ).toBe('header');
    });

    test('patch on save button click', () => {
        const wrapper = shallow(
            <EditChannelHeaderModal {...baseProps}/>,
        );

        const newHeader = 'New channel header';
        wrapper.setState({header: newHeader});
        wrapper.find('.save-button').simulate('click');

        expect(baseProps.actions.patchChannel).toBeCalledWith('fake-id', {header: newHeader});
    });

    test('patch on enter keypress event with ctrl', () => {
        const wrapper = shallow(
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
        const wrapper = shallow(
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
        const wrapper = shallow(
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

    testComponentForLineBreak(
        (value: string) => (
            <EditChannelHeaderModal
                {...baseProps}
                channel={{
                    ...baseProps.channel,
                    header: value,
                }}
            />
        ),
        (instance: EditChannelHeaderModalClass) => instance.state.header,
        false,
    );
});
