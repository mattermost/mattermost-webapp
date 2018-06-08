// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {shallow} from 'enzyme';

import ChannelMembersModal from 'components/channel_members_modal/channel_members_modal.jsx';

describe('components/ChannelMembersModal', () => {
    const baseProps = {
        channel: {id: 'channel_id', display_name: 'channel_display_name'},
        canManageChannelMembers: true,
        onModalDismissed: () => {}, //eslint-disable-line no-empty-function
        showInviteModal: () => {}, //eslint-disable-line no-empty-function
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ChannelMembersModal {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <ChannelMembersModal {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called props.showInviteModal and match state when onClickManageChannelsButton is called', () => {
        const showInviteModal = jest.fn();
        const props = {...baseProps, showInviteModal};
        const wrapper = shallow(
            <ChannelMembersModal {...props}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().onClickManageChannelsButton();
        expect(showInviteModal).toHaveBeenCalledTimes(1);
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have state when Modal.onHide', () => {
        const wrapper = shallow(
            <ChannelMembersModal {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.find(Modal).first().props().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called props.onModalDismissed when Modal.onExited', () => {
        const onModalDismissed = jest.fn();
        const props = {...baseProps, onModalDismissed};
        const wrapper = shallow(
            <ChannelMembersModal {...props}/>
        );

        wrapper.find(Modal).first().props().onExited();
        expect(onModalDismissed).toHaveBeenCalledTimes(1);
    });
});
