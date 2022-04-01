// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Overlay} from 'react-bootstrap';

import PopoverListMembers from 'components/popover_list_members/popover_list_members';

import {TestHelper} from 'utils/test_helper';

jest.mock('utils/browser_history', () => {
    const original = jest.requireActual('utils/browser_history');
    return {
        ...original,
        browserHistory: {
            push: jest.fn(),
        },
    };
});

describe('components/PopoverListMembers', () => {
    // required state to mount using the provider
    const channel = TestHelper.getChannelMock({
        id: 'channel_id',
        name: 'channel-name',
        display_name: 'Channel Name',
        type: 'D',
    });
    const user1 = TestHelper.getUserMock({id: 'member_id_1', delete_at: 0});
    const user2 = TestHelper.getUserMock({id: 'member_id_2', delete_at: 0});
    const users = [user1, user2];
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
        manageMembers: true,
        memberCount: 2,
        currentUserId: 'current_user_id',
        actions,
        sortedUsers: [user1, user2],
        teamUrl: '/team',
    };

    const bottomProps = {
        ...baseProps,
        addMembersABTest: 'bottom',
        channel: {...channel, delete_at: 0},
    };

    const topProps = {
        ...baseProps,
        addMembersABTest: 'top',
        channel: {...channel, delete_at: 0},
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <PopoverListMembers {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have called openDirectChannelToUserId when handleShowDirectChannel is called', (done) => {
        const browserHistory = require('utils/browser_history').browserHistory; //eslint-disable-line global-require
        const wrapper = shallow(
            <PopoverListMembers {...baseProps}/>,
        );

        wrapper.find('#member_popover').prop('onClick')!({preventDefault: jest.fn()} as unknown as React.MouseEvent);
        expect(wrapper.find(Overlay).prop('show')).toEqual(true);
        wrapper.find(Overlay).prop('onHide')!();

        const teamMate = TestHelper.getUserMock({id: 'teammateId', delete_at: 0});
        wrapper.find('.more-modal__list').childAt(0).prop('onItemClick')(teamMate);

        expect(baseProps.actions.openDirectChannelToUserId).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
            expect(browserHistory.push).toHaveBeenCalledTimes(1);
            expect(browserHistory.push).toHaveBeenCalledWith(`${baseProps.teamUrl}/channels/channelname`);
            expect(wrapper.find(Overlay).prop('show')).toEqual(false);
            done();
        });
    });

    test('should match state when closePopover is called', () => {
        const wrapper = shallow(
            <PopoverListMembers {...baseProps}/>,
        );

        wrapper.find('#member_popover').prop('onClick')!({preventDefault: jest.fn()} as unknown as React.MouseEvent);
        expect(wrapper.find(Overlay).prop('show')).toEqual(true);
        wrapper.find(Overlay).prop('onHide')!();
        expect(wrapper.find(Overlay).prop('show')).toEqual(false);
    });

    test('should match snapshot with archived channel', () => {
        const props = {...baseProps, channel: {...channel, delete_at: 1234}};

        const wrapper = shallow(
            <PopoverListMembers {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with group-constrained channel', () => {
        const props = {...baseProps, channel: {...channel, group_constrained: true}};

        const wrapper = shallow(
            <PopoverListMembers {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should place the Add button at the top when the flag for placement is TOP', () => {
        const wrapper = shallow(
            <PopoverListMembers {...topProps}/>,
        );

        const addBtn = wrapper.find('button#addBtn');

        expect(addBtn).toHaveLength(1);
    });

    test('should SHOW the Add button when there are permissions to manage members', () => {
        const props = {...topProps, manageMembers: true};

        const wrapper = shallow(
            <PopoverListMembers {...props}/>,
        );

        const addBtn = wrapper.find('button#addBtn');

        expect(addBtn).toHaveLength(1);
    });

    test('should HIDE the Add button when there are no permissions to manage members', () => {
        const props = {...topProps, manageMembers: false};

        const wrapper = shallow(
            <PopoverListMembers {...props}/>,
        );

        const addBtn = wrapper.find('button#addBtn');

        expect(addBtn).toHaveLength(0);
    });

    test('should SHOW the Add button when there are permissions to manage members and the placement is BOTTTOM', () => {
        const props = {...bottomProps, manageMembers: true};

        const wrapper = shallow(
            <PopoverListMembers {...props}/>,
        );

        const addBtn = wrapper.find('.more-modal__button button').findWhere((button) => button.text() === 'Add Members');

        expect(addBtn).toHaveLength(0);
    });
    test('should HIDE the Add button when there are no permissions to manage members and the placement is BOTTTOM', () => {
        const props = {...bottomProps, manageMembers: false};

        const wrapper = shallow(
            <PopoverListMembers {...props}/>,
        );

        const addBtn = wrapper.find('.more-modal__button button').findWhere((button) => button.text() === 'Add Members');

        expect(addBtn).toHaveLength(0);
    });

    test('should place the edit button at the top when the flag for placement is BOTTOM', () => {
        const wrapper = shallow(
            <PopoverListMembers {...bottomProps}/>,
        );

        const addBtn = wrapper.find('button#editBtn');

        expect(addBtn).toHaveLength(1);
    });
});
