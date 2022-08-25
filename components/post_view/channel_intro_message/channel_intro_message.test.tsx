// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelIntroMessage from './channel_intro_message';
import DMIntroMessage from './messages/dm';
import StandardIntroMessage from './messages/standard';
import GMIntroMessage from './messages/gm';
import DefaultIntroMessage from './messages/default';
import OffTopicIntroMessage from './messages/off_topic';
import {channel, defaultChannel, directChannel, groupChannel, offTopicChannel} from './messages/test_utils';

describe('components/post_view/ChannelIntroMessages', () => {
    const baseProps = {
        channel,
        channelProfiles: [],
        creatorName: 'creatorName',
        currentUserId: 'test-user-id',
        enableUserCreation: false,
        fullWidth: true,
        locale: 'en',
        stats: {},
        teamIsGroupConstrained: false,
        usersLimit: 10,
        actions: {
            getTotalUsersStats: jest.fn().mockResolvedValue([]),
        },
    };

    describe('test Open Channel', () => {
        test('should find StandardIntroMessage', () => {
            const wrapper = shallow(
                <ChannelIntroMessage{...baseProps}/>,
            );
            expect(wrapper.find(StandardIntroMessage));
        });
    });

    describe('test Group Channel', () => {
        test('should find GMIntroMessage', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...baseProps}
                    channel={groupChannel}
                />,
            );
            expect(wrapper.find(GMIntroMessage));
        });
    });

    describe('test DIRECT Channel', () => {
        test('should find DMIntroMessage', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...baseProps}
                    channel={directChannel}
                />,
            );
            expect(wrapper.find(DMIntroMessage));
        });
    });

    describe('test DEFAULT Channel', () => {
        test('should find DefaultIntroMessage', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...baseProps}
                    channel={defaultChannel}
                    isReadOnly={true}
                />,
            );
            expect(wrapper.find(DefaultIntroMessage));
        });
    });

    describe('test OFFTOPIC Channel', () => {
        test('should find OffTopicIntroMessage', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...baseProps}
                    channel={offTopicChannel}
                />,
            );
            expect(wrapper.find(OffTopicIntroMessage));
        });
    });
});
