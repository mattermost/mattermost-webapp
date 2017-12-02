// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants.jsx';

import SidebarChannel from 'components/sidebar/sidebar_channel.jsx';

describe('component/sidebar/sidebar_channel/SidebarChannel', () => {
    const defaultProps = {
        channelDisplayName: 'Channel display name',
        channelName: 'channel-name',
        channelType: Constants.DM_CHANNEL,
        channelId: 'test-channel-id',
        channelStatus: 'test',
        channelTeammateId: 'teammate-id',
        channelTeammateDeletedAt: new Date(2017, 1, 1),
        index: 2,
        handleClose: jest.fn,
        unreadMsgs: 0,
        unreadMentions: 0,
        active: false,
        loadingDMChannel: false,
        currentTeamName: 'current-team',
        currentUserId: 'user-id',
        showTutorialTip: false,
        townSquareDisplayName: 'Town Square',
        offTopicDisplayName: 'Off-Topic',
        membersCount: 8
    };

    test('should match snapshot, on channel show', () => {
        const wrapper = shallow(
            <SidebarChannel {...defaultProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on fake channel show', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    channelFake: 'fake channel',
                    stringifiedChannel: '{}'
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on active channel show', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    active: true
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on myself channel show', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    currentUserId: 'myself',
                    channelTeammateId: 'myself'
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on channel show with tutorial tip', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    showTutorialTip: true,
                    channelName: Constants.DEFAULT_CHANNEL
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on channel show with unread mentions (must have mentions badge)', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    membership: {mention_count: 3},
                    unreadMentions: 4
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on channel show without unread mentions (must have no badge)', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    membership: {mention_count: 3},
                    unreadMentions: 0
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on channel show without membership and wit loading channel (must have loading badge)', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    loadingDMChannel: true
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
