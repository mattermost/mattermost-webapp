// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Constants from 'utils/constants.jsx';
import {openDirectChannelToUser} from 'actions/channel_actions.jsx';

import PopoverListMembers from 'components/popover_list_members/popover_list_members.jsx';

jest.mock('actions/channel_actions.jsx', () => ({
    openDirectChannelToUser: jest.fn(),
}));

describe('components/PopoverListMembers', () => {
    const channel = {
        id: 'channel_id',
        name: 'channel-name',
        display_name: 'Channel Name',
        type: Constants.DM_CHANNEl,
    };
    const users = [
        {id: 'member_id_1'},
        {id: 'member_id_2'},
    ];
    const statuses = {
        member_id_1: 'online',
        member_id_2: 'offline',
    };

    const actions = {
        getProfilesInChannel: () => {}, // eslint-disable-line no-empty-function
    };

    const baseProps = {
        channel,
        statuses,
        users,
        memberCount: 2,
        currentUserId: 'current_user_id',
        actions,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <PopoverListMembers {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have called openDirectChannelToUser when handleShowDirectChannel is called', () => {
        const wrapper = shallow(
            <PopoverListMembers {...baseProps}/>
        );

        wrapper.instance().handleShowDirectChannel({
            id: 'teammateId',
        });

        expect(openDirectChannelToUser).toHaveBeenCalledTimes(1);
    });

    test('should match state when closePopover is called', () => {
        const wrapper = shallow(
            <PopoverListMembers {...baseProps}/>
        );

        wrapper.instance().componentDidUpdate = jest.fn();
        wrapper.setState({showPopover: true});
        wrapper.instance().closePopover();

        expect(wrapper.state('showPopover')).toEqual(false);
    });

    test('should match state when showMembersModal is called', () => {
        const wrapper = shallow(
            <PopoverListMembers {...baseProps}/>
        );

        wrapper.instance().componentDidUpdate = jest.fn();
        wrapper.setState({showPopover: true, showChannelMembersModal: false});
        expect(wrapper).toMatchSnapshot();

        wrapper.instance().showMembersModal({preventDefault: jest.fn()});
        expect(wrapper.state('showPopover')).toEqual(false);
        expect(wrapper.state('showChannelMembersModal')).toEqual(true);
    });

    test('should match state when hideChannelMembersModal is called', () => {
        const wrapper = shallow(
            <PopoverListMembers {...baseProps}/>
        );

        wrapper.instance().componentDidUpdate = jest.fn();
        wrapper.setState({showChannelMembersModal: true});
        wrapper.instance().hideChannelMembersModal({preventDefault: jest.fn()});

        expect(wrapper.state('showChannelMembersModal')).toEqual(false);
    });

    test('should match state when showChannelInviteModal is called', () => {
        const wrapper = shallow(
            <PopoverListMembers {...baseProps}/>
        );

        wrapper.instance().componentDidUpdate = jest.fn();
        wrapper.setState({showChannelInviteModal: false});
        expect(wrapper).toMatchSnapshot();

        wrapper.instance().showChannelInviteModal({preventDefault: jest.fn()});
        expect(wrapper.state('showChannelInviteModal')).toEqual(true);
    });

    test('should match state when hideChannelInviteModal is called', () => {
        const wrapper = shallow(
            <PopoverListMembers {...baseProps}/>
        );

        wrapper.instance().componentDidUpdate = jest.fn();
        wrapper.setState({showChannelInviteModal: true});
        wrapper.instance().hideChannelInviteModal({preventDefault: jest.fn()});

        expect(wrapper.state('showChannelInviteModal')).toEqual(false);
    });

    test('should match state when hideTeamMembersModal is called', () => {
        const wrapper = shallow(
            <PopoverListMembers {...baseProps}/>
        );

        wrapper.instance().componentDidUpdate = jest.fn();
        wrapper.setState({showTeamMembersModal: true});
        wrapper.instance().hideTeamMembersModal({preventDefault: jest.fn()});

        expect(wrapper.state('showTeamMembersModal')).toEqual(false);
    });
});
