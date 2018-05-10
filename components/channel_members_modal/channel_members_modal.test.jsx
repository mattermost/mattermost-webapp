// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Modal} from 'react-bootstrap';

import ChannelMembersModal from 'components/channel_members_modal/channel_members_modal';

describe('components/ChannelMembersModal', () => {
    const baseProps = {
        channel: {
            display_name: 'testchannel',
            header: '',
            name: 'testchannel',
            purpose: '',
        },
        canManageChannelMembers: true,
        onModalDismissed: () => {}, // eslint-disable-line no-empty-function
        showInviteModal: () => {},  // eslint-disable-line no-empty-function
    };

    test('renders the channel display name', () => {
        const wrapper = shallow(
            <ChannelMembersModal {...baseProps}/>
        );
        expect(wrapper.find('.name').text()).toBe(baseProps.channel.display_name);
    });

    test('should call the onHide callback when the modal is hidden', () => {
        const onModalDismissed = jest.fn();
        const newProps = {...baseProps, onModalDismissed};
        const wrapper = shallow(
            <ChannelMembersModal {...newProps}/>
        );
        expect(onModalDismissed).not.toHaveBeenCalled();
        wrapper.find(Modal).first().props().onExited();
        expect(onModalDismissed).toHaveBeenCalled();
    });

    test('should show the invite modal link if the user can manage channel members', () => {
        const newProps = {...baseProps, canManageChannelMembers: true};
        const wrapper = shallow(
            <ChannelMembersModal {...newProps}/>
        );
        expect(wrapper.find('#showInviteModal').length).toBe(1);
    });

    test('should not show the invite modal link if the user can not manage channel members', () => {
        const newProps = {...baseProps, canManageChannelMembers: false};
        const wrapper = shallow(
            <ChannelMembersModal {...newProps}/>
        );
        expect(wrapper.find('#showInviteModal').length).toBe(0);
    });

    test('should call showInviteModal when the invite modal link is clicked', () => {
        const showInviteModal = jest.fn();
        const newProps = {...baseProps, canManageChannelMembers: false, showInviteModal};
        const wrapper = shallow(
            <ChannelMembersModal {...newProps}/>
        );
        expect(showInviteModal).not.toHaveBeenCalled();
        wrapper.instance().onClickManageChannelsButton();
        expect(showInviteModal).toHaveBeenCalled();
    });
});
