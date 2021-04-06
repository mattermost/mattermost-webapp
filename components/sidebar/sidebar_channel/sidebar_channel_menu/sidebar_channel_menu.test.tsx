// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ShallowWrapper} from 'enzyme';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {ChannelType} from 'mattermost-redux/types/channels';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import Constants from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import SidebarChannelMenu, {SidebarChannelMenu as SidebarChannelMenuType} from './sidebar_channel_menu';

describe('components/sidebar/sidebar_channel/sidebar_channel_menu', () => {
    const testChannel = TestHelper.getChannelMock();
    const testCategory = TestHelper.getCategoryMock();

    const baseProps = {
        channel: testChannel,
        channelLink: 'http://a.fake.link',
        categories: [testCategory],
        currentUserId: 'user_id',
        currentCategory: testCategory,
        currentTeamId: 'team_id',
        isUnread: false,
        isFavorite: false,
        isMuted: false,
        managePublicChannelMembers: true,
        managePrivateChannelMembers: true,
        closeHandler: jest.fn(),
        isCollapsed: false,
        isMenuOpen: true,
        onToggleMenu: jest.fn(),
        multiSelectedChannelIds: [],
        displayedChannels: [],
        actions: {
            markChannelAsRead: jest.fn(),
            favoriteChannel: jest.fn(),
            unfavoriteChannel: jest.fn(),
            muteChannel: jest.fn(),
            unmuteChannel: jest.fn(),
            openModal: jest.fn(),
            createCategory: jest.fn(),
            addChannelsInSidebar: jest.fn(),
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

    test('should match snapshot of rendered items', () => {
        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...baseProps}/>,
        ) as ShallowWrapper<any, any, SidebarChannelMenuType>;

        expect(wrapper.instance().renderDropdownItems()).toMatchSnapshot();
    });

    test('should match snapshot of rendered items when multiselecting channels - public channels and DM category', () => {
        const props = {
            ...baseProps,
            categories: [
                ...baseProps.categories,
                TestHelper.getCategoryMock({
                    id: 'dm_category_id',
                    display_name: 'direct_messages',
                    type: CategoryTypes.DIRECT_MESSAGES,
                }),
            ],
            multiSelectedChannelIds: ['not_a_dm_channel', 'channel_id'],
            displayedChannels: [
                testChannel,
                TestHelper.getChannelMock({
                    id: 'not_a_dm_channel',
                }),
            ],
        };

        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...props}/>,
        ) as ShallowWrapper<any, any, SidebarChannelMenuType>;

        expect(wrapper.instance().renderDropdownItems()).toMatchSnapshot();
    });

    test('should match snapshot of rendered items when multiselecting channels - DM channels and public channels category', () => {
        const props = {
            ...baseProps,
            categories: [
                ...baseProps.categories,
                TestHelper.getCategoryMock({
                    id: 'channels_category_id',
                    display_name: 'channels',
                    type: CategoryTypes.CHANNELS,
                }),
            ],
            multiSelectedChannelIds: ['a_dm_channel', 'channel_id'],
            displayedChannels: [
                TestHelper.getChannelMock({
                    ...testChannel,
                    type: 'D',
                }),
                TestHelper.getChannelMock({
                    id: 'a_dm_channel',
                    type: 'D',
                }),
            ],
        };

        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...props}/>,
        ) as ShallowWrapper<any, any, SidebarChannelMenuType>;

        expect(wrapper.instance().renderDropdownItems()).toMatchSnapshot();
    });

    test('should copy state from SidebarMenu when refCallback is called', () => {
        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...baseProps}/>,
        ) as ShallowWrapper<typeof baseProps, any, SidebarChannelMenuType>;

        const ref = {
            state: {
                openUp: false,
            },
        };

        wrapper.instance().refCallback(ref as any);
        expect(wrapper.instance().state.openUp).toEqual(ref.state.openUp);
    });

    test('should call the close handler when leave channel is clicked', () => {
        const wrapper = shallowWithIntl(
            <SidebarChannelMenu {...baseProps}/>,
        ) as ShallowWrapper<typeof baseProps, any, SidebarChannelMenuType>;

        wrapper.instance().handleLeaveChannel({preventDefault: jest.fn(), stopPropagation: jest.fn()} as any);
        expect(baseProps.closeHandler).toHaveBeenCalled();
    });
});
