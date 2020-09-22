// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ShallowWrapper} from 'enzyme';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {CategorySorting} from 'mattermost-redux/types/channel_categories';
import {ChannelType} from 'mattermost-redux/types/channels';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import Constants from 'utils/constants';

import SidebarChannelMenu, {SidebarChannelMenu as SidebarChannelMenuType} from './sidebar_channel_menu';

describe('components/sidebar/sidebar_channel/sidebar_channel_menu', () => {
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
        channelLink: 'http://a.fake.link',
        categories: [{
            id: 'category1',
            team_id: 'team1',
            user_id: 'user_id',
            type: CategoryTypes.CUSTOM,
            display_name: 'custom_category_1',
            sorting: CategorySorting.Alphabetical,
            channel_ids: ['channel_id'],
        }],
        currentUserId: 'user_id',
        currentCategory: {
            id: 'category1',
            team_id: 'team1',
            user_id: 'user_id',
            type: CategoryTypes.CUSTOM,
            sorting: CategorySorting.Alphabetical,
            channel_ids: ['channel_id'],
            display_name: 'custom_category_1',
        },
        currentTeamId: 'team1',
        isUnread: false,
        isFavorite: false,
        isMuted: false,
        managePublicChannelMembers: true,
        managePrivateChannelMembers: true,
        closeHandler: jest.fn(),
        isCollapsed: false,
        isMenuOpen: false,
        onToggleMenu: jest.fn(),
        actions: {
            markChannelAsRead: jest.fn(),
            favoriteChannel: jest.fn(),
            unfavoriteChannel: jest.fn(),
            muteChannel: jest.fn(),
            unmuteChannel: jest.fn(),
            openModal: jest.fn(),
            createCategory: jest.fn(),
            addChannelToCategory: jest.fn(),
        },
    };

    test('should match snapshot and contain correct buttons', () => {
        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...baseProps}/>,
        );

        expect(wrapper.find('#favorite-channel_id')).toHaveLength(1);
        expect(wrapper.find('#mute-channel_id')).toHaveLength(1);
        expect(wrapper.find('#copyLink-channel_id')).toHaveLength(1);
        expect(wrapper.find('#addMembers-channel_id')).toHaveLength(1);
        expect(wrapper.find('#leave-channel_id')).toHaveLength(1);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when channel is unread', () => {
        const props = {
            ...baseProps,
            isUnread: true,
        };

        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...props}/>,
        );

        expect(wrapper.find('#markAsRead-channel_id')).toHaveLength(1);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when channel is favorite', () => {
        const props = {
            ...baseProps,
            isFavorite: true,
        };

        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...props}/>,
        );

        expect(wrapper.find('#favorite-channel_id')).toHaveLength(0);
        expect(wrapper.find('#unfavorite-channel_id')).toHaveLength(1);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when channel is muted', () => {
        const props = {
            ...baseProps,
            isMuted: true,
        };

        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...props}/>,
        );

        expect(wrapper.find('#mute-channel_id')).toHaveLength(0);
        expect(wrapper.find('#unmute-channel_id')).toHaveLength(1);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when channel is private', () => {
        const props = {
            ...baseProps,
            channel: {
                ...baseProps.channel,
                type: 'P' as ChannelType,
            },
        };

        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...props}/>,
        );

        expect(wrapper.find('#copyLink-channel_id')).toHaveLength(1);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when channel is DM', () => {
        const props = {
            ...baseProps,
            channel: {
                ...baseProps.channel,
                type: 'D' as ChannelType,
            },
        };

        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...props}/>,
        );

        expect(wrapper.find('#copyLink-channel_id')).toHaveLength(0);
        expect(wrapper.find('#addMembers-channel_id')).toHaveLength(0);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when channel is Town Square', () => {
        const props = {
            ...baseProps,
            channel: {
                ...baseProps.channel,
                name: Constants.DEFAULT_CHANNEL,
            },
        };

        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...props}/>,
        );

        expect(wrapper.find('#leave-channel_id')).toHaveLength(0);

        expect(wrapper).toMatchSnapshot();
    });

    test('should copy state from SidebarMenu when refCallback is called', () => {
        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...baseProps}/>,
        ) as ShallowWrapper<typeof baseProps, any, SidebarChannelMenuType>;

        const ref = {
            state: {
                openUp: false,
                width: 1234,
            },
        };

        wrapper.instance().refCallback(ref as any);
        expect(wrapper.instance().state.openUp).toEqual(ref.state.openUp);
        expect(wrapper.instance().state.width).toEqual(ref.state.width);
    });

    test('should call the close handler when leave channel is clicked', () => {
        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...baseProps}/>,
        ) as ShallowWrapper<typeof baseProps, any, SidebarChannelMenuType>;

        wrapper.instance().handleLeaveChannel({preventDefault: jest.fn(), stopPropagation: jest.fn()} as any);
        expect(baseProps.closeHandler).toHaveBeenCalled();
    });
});
