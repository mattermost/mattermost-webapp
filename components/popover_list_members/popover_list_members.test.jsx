// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import Constants from 'utils/constants.jsx';
import PopoverListMembers from 'components/popover_list_members/popover_list_members.jsx';

jest.mock('utils/browser_history', () => {
    const original = require.requireActual('utils/browser_history');
    return {
        ...original,
        browserHistory: {
            push: jest.fn(),
        },
    };
});

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
        loadProfilesAndStatusesInChannel: jest.fn(),
        openDirectChannelToUserId: jest.fn().mockResolvedValue({data: {name: 'channelname'}}),
        openModal: jest.fn(),
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

    test('should have called openDirectChannelToUserId when handleShowDirectChannel is called', (done) => {
        const browserHistory = require('utils/browser_history').browserHistory; //eslint-disable-line global-require
        const wrapper = shallow(
            <PopoverListMembers {...baseProps}/>
        );

        wrapper.instance().closePopover = jest.fn();
        wrapper.instance().handleShowDirectChannel({
            id: 'teammateId',
        });

        expect(baseProps.actions.openDirectChannelToUserId).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(browserHistory.push).toHaveBeenCalledTimes(1);
            expect(browserHistory.push).toHaveBeenCalledWith(`${baseProps.teamUrl}/channels/channelname`);
            expect(wrapper.state('showPopover')).toEqual(false);
            done();
        });
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

    test('should match snapshot with archived channel', () => {
        const props = {...baseProps, channel: {...channel, delete_at: 1234}};

        const wrapper = shallow(
            <PopoverListMembers {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with group-constrained channel', () => {
        const props = {...baseProps, channel: {...channel, group_constrained: true}};

        const wrapper = shallow(
            <PopoverListMembers {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
