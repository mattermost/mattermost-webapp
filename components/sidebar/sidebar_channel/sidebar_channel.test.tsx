// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {ChannelType} from 'mattermost-redux/types/channels';

import SidebarChannel from 'components/sidebar/sidebar_channel/sidebar_channel';

describe('components/sidebar/sidebar_channel', () => {
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
        channelIndex: 0,
        currentTeamName: 'team_name',
        unreadMentions: 0,
        unreadMsgs: 0,
        showUnreadForMsgs: false,
        getChannelRef: jest.fn(),
        setChannelRef: jest.fn(),
        isCategoryCollapsed: false,
        isCurrentChannel: false,
        isDMCategory: false,
        isCategoryDragged: false,
        isDropDisabled: false,
        draggingState: {},
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SidebarChannel {...baseProps}/>,
        );

        const draggable = wrapper.dive().find('PrivateDraggable').first();
        const children: any = draggable.prop('children')!;
        const inner = shallow(
            children({}, {}),
        );
        expect(inner).toMatchSnapshot();
    });

    test('should match snapshot when collapsed', () => {
        const props = {
            ...baseProps,
            isCategoryCollapsed: true,
        };

        const wrapper = shallow(
            <SidebarChannel {...props}/>,
        );

        const draggable = wrapper.dive().find('PrivateDraggable').first();
        const children: any = draggable.prop('children')!;
        const inner = shallow(
            children({}, {}),
        );
        expect(inner).toMatchSnapshot();
    });

    test('should match snapshot when unread', () => {
        const props = {
            ...baseProps,
            unreadMentions: 1,
        };

        const wrapper = shallow(
            <SidebarChannel {...props}/>,
        );

        const draggable = wrapper.dive().find('PrivateDraggable').first();
        const children: any = draggable.prop('children')!;
        const inner = shallow(
            children({}, {}),
        );
        expect(inner).toMatchSnapshot();
    });

    test('should match snapshot when active', () => {
        const props = {
            ...baseProps,
            isCurrentChannel: true,
        };

        const wrapper = shallow(
            <SidebarChannel {...props}/>,
        );

        const draggable = wrapper.dive().find('PrivateDraggable').first();
        const children: any = draggable.prop('children')!;
        const inner = shallow(
            children({}, {}),
        );
        expect(inner).toMatchSnapshot();
    });

    test('should match snapshot when DM channel', () => {
        const props = {
            ...baseProps,
            channel: {
                ...baseProps.channel,
                type: 'D' as ChannelType,
            },
        };

        const wrapper = shallow(
            <SidebarChannel {...props}/>,
        );

        const draggable = wrapper.dive().find('PrivateDraggable').first();
        const children: any = draggable.prop('children')!;
        const inner = shallow(
            children({}, {}),
        );
        expect(inner).toMatchSnapshot();
    });

    test('should match snapshot when GM channel', () => {
        const props = {
            ...baseProps,
            channel: {
                ...baseProps.channel,
                type: 'G' as ChannelType,
            },
        };

        const wrapper = shallow(
            <SidebarChannel {...props}/>,
        );

        const draggable = wrapper.dive().find('PrivateDraggable').first();
        const children: any = draggable.prop('children')!;
        const inner = shallow(
            children({}, {}),
        );
        expect(inner).toMatchSnapshot();
    });

    test('should not be collapsed when there are unread messages', () => {
        const props = {
            ...baseProps,
            isCategoryCollapsed: true,
        };

        const wrapper = shallow<SidebarChannel>(
            <SidebarChannel {...props}/>,
        );

        wrapper.instance().isUnread = jest.fn(() => true);
        expect(wrapper.instance().isCollapsed(wrapper.instance().props)).toBe(false);
    });

    test('should not be collapsed if channel is current channel', () => {
        const props = {
            ...baseProps,
            isCategoryCollapsed: true,
            isCurrentChannel: true,
        };

        const wrapper = shallow<SidebarChannel>(
            <SidebarChannel {...props}/>,
        );

        expect(wrapper.instance().isCollapsed(wrapper.instance().props)).toBe(false);
    });
});
