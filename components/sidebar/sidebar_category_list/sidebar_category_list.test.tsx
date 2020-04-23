// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {ChannelType} from 'mattermost-redux/types/channels';
import {TeamType} from 'mattermost-redux/types/teams';

import SidebarCategoryList from 'components/sidebar/sidebar_category_list/sidebar_category_list';

describe('components/sidebar/sidebar_category_list', () => {
    const currentChannel = {
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
    };

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
        currentTeam: {
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
        },
        currentChannel,
        categories: [
            {
                id: 'category1',
                team_id: 'team1',
                type: CategoryTypes.CUSTOM,
                display_name: 'custom_category_1',
            },
        ],
        unreadChannelIds: ['channel_id_2'],
        displayedChannels: [currentChannel, unreadChannel],
        isUnreadFilterEnabled: false,
        handleOpenMoreDirectChannelsModal: jest.fn(),
        actions: {
            switchToChannelById: jest.fn(),
            close: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SidebarCategoryList {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when unread filter is enabled', () => {
        const props = {
            ...baseProps,
            isUnreadFilterEnabled: true,
        };

        const wrapper = shallow(
            <SidebarCategoryList {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should close sidebar on mobile when channel is selected (ie. changed)', () => {
        const wrapper = shallow(
            <SidebarCategoryList {...baseProps}/>
        );

        const newCurrentChannel = {
            ...currentChannel,
            id: 'new_channel_id',
        };

        wrapper.setProps({currentChannel: newCurrentChannel});
        expect(baseProps.actions.close).toHaveBeenCalled();
    });

    test('should scroll to top when team changes', () => {
        const wrapper = shallow<SidebarCategoryList>(
            <SidebarCategoryList {...baseProps}/>
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
        const wrapper = shallow<SidebarCategoryList>(
            <SidebarCategoryList {...baseProps}/>
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
        const wrapper = shallow<SidebarCategoryList>(
            <SidebarCategoryList {...baseProps}/>
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
});
