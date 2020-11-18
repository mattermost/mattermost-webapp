// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {MovementMode, DropResult} from 'react-beautiful-dnd';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {CategorySorting} from 'mattermost-redux/types/channel_categories';
import {ChannelType} from 'mattermost-redux/types/channels';
import {TeamType} from 'mattermost-redux/types/teams';

import {TestHelper} from 'utils/test_helper';

import {DraggingStates, DraggingStateTypes} from 'utils/constants';

import SidebarChannelList from './sidebar_channel_list';

describe('SidebarChannelList', () => {
    const currentChannel = TestHelper.getChannelMock({
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
    });

    const unreadChannel = {
        id: 'channel_id_2',
        display_name: 'channel_display_name_2',
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
    };

    const baseProps = {
        currentTeam: TestHelper.getTeamMock({
            id: 'kemjcpu9bi877yegqjs18ndp4r',
            invite_id: 'ojsnudhqzbfzpk6e4n6ip1hwae',
            name: 'test',
            create_at: 123,
            update_at: 123,
            delete_at: 123,
            display_name: 'test',
            description: 'test',
            email: 'test',
            type: 'O' as TeamType,
            company_name: 'test',
            allowed_domains: 'test',
            allow_open_invite: false,
            scheme_id: 'test',
            group_constrained: false,
        }),
        currentChannelId: currentChannel.id,
        categories: [
            {
                id: 'category1',
                team_id: 'team1',
                user_id: '',
                type: CategoryTypes.CUSTOM,
                display_name: 'custom_category_1',
                sorting: CategorySorting.Alphabetical,
                channel_ids: ['channel_id', 'channel_id_2'],
            },
        ],
        unreadChannelIds: ['channel_id_2'],
        displayedChannels: [currentChannel, unreadChannel],
        newCategoryIds: [],
        isUnreadFilterEnabled: false,
        draggingState: {},
        categoryCollapsedState: {},
        handleOpenMoreDirectChannelsModal: jest.fn(),
        onDragStart: jest.fn(),
        onDragEnd: jest.fn(),
        actions: {
            switchToChannelById: jest.fn(),
            close: jest.fn(),
            moveChannelInSidebar: jest.fn(),
            moveCategory: jest.fn(),
            removeFromCategory: jest.fn(),
            setDraggingState: jest.fn(),
            stopDragging: jest.fn(),
            expandCategory: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SidebarChannelList {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();

        const draggable = wrapper.find('Connect(Droppable)').first();
        const children: any = draggable.prop('children')!;
        const inner = shallow(
            children({}, {}),
        );
        expect(inner).toMatchSnapshot();
    });

    test('should close sidebar on mobile when channel is selected (ie. changed)', () => {
        const wrapper = shallow(
            <SidebarChannelList {...baseProps}/>,
        );

        wrapper.setProps({currentChannelId: 'new_channel_id'});
        expect(baseProps.actions.close).toHaveBeenCalled();
    });

    test('should scroll to top when team changes', () => {
        const wrapper = shallow<SidebarChannelList>(
            <SidebarChannelList {...baseProps}/>,
        );

        wrapper.instance().scrollbar = {
            current: {
                scrollToTop: jest.fn(),
            } as any,
        };

        const newCurrentTeam = {
            ...baseProps.currentTeam,
            id: 'new_team',
        };

        wrapper.setProps({currentTeam: newCurrentTeam});
        expect(wrapper.instance().scrollbar.current!.scrollToTop).toHaveBeenCalled();
    });

    test('should display unread scroll indicator when channels appear outside visible area', () => {
        const wrapper = shallow<SidebarChannelList>(
            <SidebarChannelList {...baseProps}/>,
        );
        const instance = wrapper.instance();

        instance.scrollbar = {
            current: {
                getScrollTop: jest.fn(() => 0),
                getClientHeight: jest.fn(() => 500),
            } as any,
        };

        instance.channelRefs.set(unreadChannel.id, {
            offsetTop: 1,
            offsetHeight: 0,
        } as any);

        instance.updateUnreadIndicators();
        expect(instance.state.showTopUnread).toBe(true);

        instance.channelRefs.set(unreadChannel.id, {
            offsetTop: 501,
            offsetHeight: 0,
        } as any);

        instance.updateUnreadIndicators();
        expect(instance.state.showBottomUnread).toBe(true);
    });

    test('should scroll to correct position when scrolling to channel', () => {
        const wrapper = shallow<SidebarChannelList>(
            <SidebarChannelList {...baseProps}/>,
        );
        const instance = wrapper.instance();

        instance.scrollToPosition = jest.fn();

        instance.scrollbar = {
            current: {
                scrollTop: jest.fn(),
                getScrollTop: jest.fn(() => 100),
                getClientHeight: jest.fn(() => 500),
            } as any,
        };

        instance.channelRefs.set(unreadChannel.id, {
            offsetTop: 50,
            offsetHeight: 20,
        } as any);

        instance.scrollToChannel(unreadChannel.id);
        expect(instance.scrollToPosition).toBeCalledWith(8); // includes margin and category header height
    });

    test('should set the dragging state based on type', () => {
        (global as any).document.querySelectorAll = jest.fn().mockReturnValue([{
            style: {},
        }]);

        const wrapper = shallow<SidebarChannelList>(
            <SidebarChannelList {...baseProps}/>,
        );

        const categoryBefore = {
            draggableId: baseProps.categories[0].id,
            mode: 'SNAP' as MovementMode,
        };
        const expectedCategoryBefore = {
            state: DraggingStates.CAPTURE,
            id: categoryBefore.draggableId,
            type: DraggingStateTypes.CATEGORY,
        };

        wrapper.instance().onBeforeCapture(categoryBefore);
        expect(baseProps.actions.setDraggingState).toHaveBeenCalledWith(expectedCategoryBefore);

        const channelBefore = {
            draggableId: currentChannel.id,
            mode: 'SNAP' as MovementMode,
        };
        const expectedChannelBefore = {
            state: DraggingStates.CAPTURE,
            id: channelBefore.draggableId,
            type: DraggingStateTypes.CHANNEL,
        };

        wrapper.instance().onBeforeCapture(channelBefore);
        expect(baseProps.actions.setDraggingState).toHaveBeenCalledWith(expectedChannelBefore);
    });

    test('should call correct action on dropping item', () => {
        const wrapper = shallow<SidebarChannelList>(
            <SidebarChannelList {...baseProps}/>,
        );

        const categoryResult: DropResult = {
            reason: 'DROP',
            type: 'SIDEBAR_CATEGORY',
            source: {
                droppableId: 'droppable-categories',
                index: 0,
            },
            destination: {
                droppableId: 'droppable-categories',
                index: 5,
            },
            draggableId: baseProps.categories[0].id,
            mode: 'SNAP' as MovementMode,
        };

        wrapper.instance().onDragEnd(categoryResult);
        expect(baseProps.actions.moveCategory).toHaveBeenCalledWith(baseProps.currentTeam.id, categoryResult.draggableId, categoryResult.destination!.index);

        const channelResult: DropResult = {
            reason: 'DROP',
            type: 'SIDEBAR_CHANNEL',
            source: {
                droppableId: baseProps.categories[0].id,
                index: 0,
            },
            destination: {
                droppableId: baseProps.categories[0].id,
                index: 5,
            },
            draggableId: baseProps.categories[0].id,
            mode: 'SNAP' as MovementMode,
        };

        wrapper.instance().onDragEnd(channelResult);
        expect(baseProps.actions.moveChannelInSidebar).toHaveBeenCalledWith(channelResult.destination!.droppableId, channelResult.draggableId, channelResult.destination!.index);
    });
});
