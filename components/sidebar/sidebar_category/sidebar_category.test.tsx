// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {ChannelType} from 'mattermost-redux/types/channels';

import SidebarCategory from 'components/sidebar/sidebar_category/sidebar_category';

describe('components/sidebar/sidebar_category', () => {
    const baseProps = {
        category: {
            id: 'category1',
            team_id: 'team1',
            type: CategoryTypes.CUSTOM,
            display_name: 'custom_category_1',
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
        setChannelRef: jest.fn(),
        getChannelRef: jest.fn(),
        handleOpenMoreDirectChannelsModal: jest.fn(),
        isCollapsed: false,
        actions: {
            setCategoryCollapsed: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SidebarCategory {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when collapsed', () => {
        const props = {
            ...baseProps,
            isCollapsed: true,
        };

        const wrapper = shallow(
            <SidebarCategory {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when the category is DM and there are no DMs to display', () => {
        const props = {
            ...baseProps,
            category: {
                ...baseProps.category,
                type: CategoryTypes.DIRECT_MESSAGES,
            },
            channels: [],
        };

        const wrapper = shallow(
            <SidebarCategory {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when there are no channels to display', () => {
        const props = {
            ...baseProps,
            channels: [],
        };

        const wrapper = shallow(
            <SidebarCategory {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should collapse the channel on toggle when it is not collapsed', () => {
        const wrapper = shallow<SidebarCategory>(
            <SidebarCategory {...baseProps}/>
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
            <SidebarCategory {...props}/>
        );

        wrapper.instance().handleCollapse();
        expect(baseProps.actions.setCategoryCollapsed).toHaveBeenCalledWith(props.category.id, false);
    });
});
