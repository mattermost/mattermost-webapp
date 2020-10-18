// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {shallow} from 'enzyme';
import {ChannelType} from 'mattermost-redux/types/channels';

import ChannelInviteModal from 'components/channel_invite_modal';
import {ModalIdentifiers} from 'utils/constants';

import ChannelMembersModal from './channel_members_modal';

describe('components/ChannelMembersModal', () => {
    const baseProps = {
        channel: {
            id: 'channel_id',
            display_name: 'channel_display_name',
            create_at: 0,
            update_at: 0,
            delete_at: 0,
            team_id: '',
            type: 'O' as ChannelType,
            name: '',
            header: '',
            purpose: '',
            last_post_at: 0,
            total_msg_count: 0,
            extra_update_at: 0,
            creator_id: '',
            scheme_id: '',
            group_constrained: false,
        },
        canManageChannelMembers: true,
        onHide: jest.fn(),
        actions: {
            openModal: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ChannelMembersModal {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <ChannelMembersModal {...baseProps}/>,
        );

        wrapper.setState({show: true});
        (wrapper.instance() as ChannelMembersModal).handleHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should have called props.actions.openModal and props.onHide when onAddNewMembersButton is called', () => {
        const onHide = jest.fn();
        const openModal = jest.fn();
        const props = {
            ...baseProps,
            onHide,
            actions: {
                openModal,
            },
        };
        const wrapper = shallow(
            <ChannelMembersModal {...props}/>,
        );

        (wrapper.instance() as ChannelMembersModal).onAddNewMembersButton();
        expect(openModal).toHaveBeenCalledTimes(1);
        expect(onHide).toHaveBeenCalledTimes(1);
    });

    test('should have state when Modal.onHide', () => {
        const wrapper = shallow(
            <ChannelMembersModal {...baseProps}/>,
        );

        wrapper.setState({show: true});
        wrapper.find(Modal).first().props().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should match snapshot with archived channel', () => {
        const props = {...baseProps, channel: {...baseProps.channel, delete_at: 1234}};

        const wrapper = shallow(
            <ChannelMembersModal {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('renders the channel display name', () => {
        const wrapper = shallow(
            <ChannelMembersModal {...baseProps}/>,
        );
        expect(wrapper.find('.name').text()).toBe(baseProps.channel.display_name);
    });

    test('should show the invite modal link if the user can manage channel members', () => {
        const newProps = {...baseProps, canManageChannelMembers: true};
        const wrapper = shallow(
            <ChannelMembersModal {...newProps}/>,
        );
        expect(wrapper.find('#showInviteModal').length).toBe(1);
    });

    test('should not show the invite modal link if the user can not manage channel members', () => {
        const newProps = {...baseProps, canManageChannelMembers: false};
        const wrapper = shallow(
            <ChannelMembersModal {...newProps}/>,
        );
        expect(wrapper.find('#showInviteModal').length).toBe(0);
    });

    test('should call openModal with ChannelInviteModal when the add members link is clicked', () => {
        const openModal = jest.fn();
        const newProps = {
            ...baseProps,
            canManageChannelMembers: false,
            actions: {
                openModal,
            },
        };
        const wrapper = shallow(
            <ChannelMembersModal {...newProps}/>,
        );
        expect(openModal).not.toHaveBeenCalled();
        (wrapper.instance() as ChannelMembersModal).onAddNewMembersButton();
        expect(openModal).toHaveBeenCalledWith({
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogType: ChannelInviteModal,
            dialogProps: {channel: newProps.channel},
        });
    });
});
