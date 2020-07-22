// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {ChannelType} from 'mattermost-redux/types/channels';

import SidebarBaseChannel from 'components/sidebar/sidebar_channel/sidebar_base_channel/sidebar_base_channel';

describe('components/sidebar/sidebar_channel/sidebar_base_channel', () => {
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
        currentTeamName: 'team_name',
        isCollapsed: false,
        actions: {
            leaveChannel: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SidebarBaseChannel {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when private channel', () => {
        const props = {
            ...baseProps,
            channel: {
                ...baseProps.channel,
                type: 'P' as ChannelType,
            },
        };

        const wrapper = shallow(
            <SidebarBaseChannel {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should use correct close handler when experimental setting is enabled', () => {
        const props = {
            ...baseProps,
            enableXToLeaveChannelsFromLHS: 'true',
        };

        const wrapper = shallow<SidebarBaseChannel>(
            <SidebarBaseChannel {...props}/>,
        );

        expect(wrapper.instance().getCloseHandler()).toBe(wrapper.instance().handleLeavePublicChannel);
    });
});
