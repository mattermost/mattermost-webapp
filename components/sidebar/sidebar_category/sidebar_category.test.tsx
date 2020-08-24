// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {CategorySorting} from 'mattermost-redux/types/channel_categories';
import {ChannelType} from 'mattermost-redux/types/channels';

import SidebarCategory from 'components/sidebar/sidebar_category/sidebar_category';

describe('components/sidebar/sidebar_category', () => {
    const baseProps = {
        category: {
            id: 'category1',
            team_id: 'team1',
            user_id: '',
            type: CategoryTypes.CUSTOM,
            display_name: 'custom_category_1',
            channel_ids: ['channel_id'],
            sorting: CategorySorting.Alphabetical,
        },
        channels: [
            {
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
        ],
        categoryIndex: 0,
        draggingState: {},
        setChannelRef: jest.fn(),
        getChannelRef: jest.fn(),
        handleOpenMoreDirectChannelsModal: jest.fn(),
        isNewCategory: false,
        isCollapsed: false,
        isDisabled: false,
        actions: {
            setCategoryCollapsed: jest.fn(),
            setCategorySorting: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SidebarCategory {...baseProps}/>,
        );

        const draggable = wrapper.dive().find('PrivateDraggable').first();
        const children: any = draggable.prop('children')!;
        const inner = shallow(
            children({}, {}),
        );
        expect(inner).toMatchSnapshot();

        const droppable = inner.find('Connect(Droppable)').first();
        const droppableChildren: any = droppable.prop('children')!;
        const droppableInner = shallow(
            droppableChildren({}, {}),
        );
        expect(droppableInner).toMatchSnapshot();
    });

    test('should match snapshot when isNewCategory', () => {
        const props = {
            ...baseProps,
            isNewCategory: true,
            category: {
                ...baseProps.category,
                channel_ids: [],
            },
            channels: [],
        };

        const wrapper = shallow(
            <SidebarCategory {...props}/>,
        );

        const draggable = wrapper.dive().find('PrivateDraggable').first();
        const children: any = draggable.prop('children')!;
        const inner = shallow(
            children({}, {}),
        );
        expect(inner).toMatchSnapshot();

        const droppable = inner.find('Connect(Droppable)').first();
        const droppableChildren: any = droppable.prop('children')!;
        const droppableInner = shallow(
            droppableChildren({}, {}),
        );
        expect(droppableInner).toMatchSnapshot();
        expect(droppableInner.find('.SidebarCategory_newLabel')).toHaveLength(1);
        expect(droppableInner.find('.SidebarCategory_newDropBox')).toHaveLength(1);
    });

    test('should match snapshot when collapsed', () => {
        const props = {
            ...baseProps,
            isCollapsed: true,
        };

        const wrapper = shallow(
            <SidebarCategory {...props}/>,
        );

        const draggable = wrapper.dive().find('PrivateDraggable').first();
        const children: any = draggable.prop('children')!;
        const inner = shallow(
            children({}, {}),
        );
        expect(inner).toMatchSnapshot();

        const droppable = inner.find('Connect(Droppable)').first();
        const droppableChildren: any = droppable.prop('children')!;
        const droppableInner = shallow(
            droppableChildren({}, {}),
        );
        expect(droppableInner).toMatchSnapshot();
    });

    test('should match snapshot when the category is DM and there are no DMs to display', () => {
        const props = {
            ...baseProps,
            category: {
                ...baseProps.category,
                type: CategoryTypes.DIRECT_MESSAGES,
                sorting: CategorySorting.Recency,
            },
            channels: [],
        };

        const wrapper = shallow(
            <SidebarCategory {...props}/>,
        );

        const draggable = wrapper.dive().find('PrivateDraggable').first();
        const children: any = draggable.prop('children')!;
        const inner = shallow(
            children({}, {}),
        );
        expect(inner).toMatchSnapshot();

        const droppable = inner.find('Connect(Droppable)').first();
        const droppableChildren: any = droppable.prop('children')!;
        const droppableInner = shallow(
            droppableChildren({}, {}),
        );
        expect(droppableInner).toMatchSnapshot();
    });

    test('should match snapshot when there are no channels to display', () => {
        const props = {
            ...baseProps,
            channels: [],
        };

        const wrapper = shallow(
            <SidebarCategory {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when sorting is set to by recency', () => {
        const props = {
            ...baseProps,
            category: {
                ...baseProps.category,
                type: CategoryTypes.DIRECT_MESSAGES,
                sorting: CategorySorting.Recency,
            },
        };

        const wrapper = shallow(
            <SidebarCategory {...props}/>,
        );

        const draggable = wrapper.dive().find('PrivateDraggable').first();
        const children: any = draggable.prop('children')!;
        const inner = shallow(
            children({}, {}),
        );
        expect(inner).toMatchSnapshot();

        const droppable = inner.find('Connect(Droppable)').first();
        const droppableChildren: any = droppable.prop('children')!;
        const droppableInner = shallow(
            droppableChildren({}, {}),
        );
        expect(droppableInner).toMatchSnapshot();
    });

    test('should collapse the channel on toggle when it is not collapsed', () => {
        const wrapper = shallow<SidebarCategory>(
            <SidebarCategory {...baseProps}/>,
        );

        wrapper.instance().handleCollapse();
        expect(baseProps.actions.setCategoryCollapsed).toHaveBeenCalledWith(baseProps.category.id, true);
    });

    test('should un-collapse the channel on toggle when it is collapsed', () => {
        const props = {
            ...baseProps,
            isCollapsed: true,
        };

        const wrapper = shallow<SidebarCategory>(
            <SidebarCategory {...props}/>,
        );

        wrapper.instance().handleCollapse();
        expect(baseProps.actions.setCategoryCollapsed).toHaveBeenCalledWith(props.category.id, false);
    });
});
