// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';

import {ChannelType} from '@mattermost/types/channels';

import Constants from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import SidebarChannelMenu from './sidebar_channel_menu';

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
        location: 'sidebar',
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

    // there is a separate ticket to adjust tests

    test('should match snapshot and contain correct buttons', () => {
        const wrapper = shallow(
            <SidebarChannelMenu {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});