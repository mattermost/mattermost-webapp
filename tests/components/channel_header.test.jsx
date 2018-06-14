// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelHeader from 'components/channel_header/channel_header';

describe('components/ChannelHeader', () => {
    const baseProps = {
        actions: {
            leaveChannel: jest.fn(),
            favoriteChannel: jest.fn(),
            unfavoriteChannel: jest.fn(),
            showFlaggedPosts: jest.fn(),
            showPinnedPosts: jest.fn(),
            showMentions: jest.fn(),
            closeRightHandSide: jest.fn(),
            updateRhsState: jest.fn(),
            openModal: jest.fn(),
            getCustomEmojisInText: jest.fn(),
            updateChannelNotifyProps: jest.fn(),
        },
        channel: {},
        channelMember: {},
        currentUser: {},
        enableWebrtc: false,
    };

    test('should render properly when empty', () => {
        const wrapper = shallow(
            <ChannelHeader {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render properly when populated', () => {
        const props = {
            ...baseProps,
            channel: {
                id: 'channel_id',
                team_id: 'team_id',
                name: 'Test',
            },
            channelMember: {
                channel_id: 'channel_id',
                user_id: 'user_id',
            },
            currentUser: {
                id: 'user_id',
            },
        };

        const wrapper = shallow(
            <ChannelHeader {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render properly when populated with channel props', () => {
        const props = {
            ...baseProps,
            channel: {
                id: 'channel_id',
                team_id: 'team_id',
                name: 'Test',
                header: 'See ~test',
                props: {
                    channel_mentions: {
                        test: {
                            display_name: 'Test',
                        },
                    },
                },
            },
            channelMember: {
                channel_id: 'channel_id',
                user_id: 'user_id',
            },
            currentUser: {
                id: 'user_id',
            },
        };

        const wrapper = shallow(
            <ChannelHeader {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
