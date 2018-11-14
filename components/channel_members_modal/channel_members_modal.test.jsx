// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {shallow} from 'enzyme';

import ChannelMembersModal from 'components/channel_members_modal/channel_members_modal.jsx';

describe('components/ChannelMembersModal', () => {
    const baseProps = {
        channel: {id: 'channel_id', display_name: 'channel_display_name', delete_at: 0},
        canManageChannelMembers: true,
        onModalDismissed: () => { }, //eslint-disable-line no-empty-function
        showInviteModal: () => { }, //eslint-disable-line no-empty-function
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

    test('should match snapshot with archived channel', () => {
        const props = {...baseProps, channel: {...baseProps.channel, delete_at: 1234}};

        const wrapper = shallow(
            <ChannelMembersModal {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});

describe('components/ChannelMembersModal', () => {
    const baseProps = {
        channel: {
            display_name: 'testchannel',
            header: '',
            name: 'testchannel',
            purpose: '',
            delete_at: 0,
        },
        canManageChannelMembers: true,
        onModalDismissed: () => {}, // eslint-disable-line no-empty-function
        showInviteModal: () => {}, // eslint-disable-line no-empty-function
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
