// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelIntroMessage, {TestIds} from './channel_intro_message';
import {channel, defaultChannel, directChannel, groupChannel, offTopicChannel, privateChannel} from './messages/test_utils';

describe('components/post_view/ChannelIntroMessages', () => {
    const baseProps = {
        channel,
        fullWidth: true,
        stats: {},
        usersLimit: 10,
        actions: {
            getTotalUsersStats: jest.fn().mockResolvedValue([]),
        },
    };

    describe('test Open Channel', () => {
        test('should find StandardIntroMessage', () => {
            const wrapper = shallow(
                <ChannelIntroMessage{...baseProps}/>,
            ).children();
            expect(wrapper.prop('data-testid')).toBe(TestIds.standard);
        });
    });

    describe('test Private Channel', () => {
        test('should find StandardIntroMessage', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...baseProps}
                    channel={privateChannel}
                />,
            ).children();
            expect(wrapper.prop('data-testid')).toBe(TestIds.standard);
        });
    });

    describe('test Group Channel', () => {
        test('should find GMIntroMessage', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...baseProps}
                    channel={groupChannel}
                />,
            ).children();
            expect(wrapper.prop('data-testid')).toBe(TestIds.gm);
        });
    });

    describe('test DIRECT Channel', () => {
        test('should find DMIntroMessage', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...baseProps}
                    channel={directChannel}
                />,
            ).children();
            expect(wrapper.prop('data-testid')).toBe(TestIds.dm);
        });
    });

    describe('test DEFAULT Channel', () => {
        test('should find DefaultIntroMessage', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...baseProps}
                    channel={defaultChannel}
                />,
            ).children();
            expect(wrapper.prop('data-testid')).toBe(TestIds.default);
        });
    });

    describe('test OFFTOPIC Channel', () => {
        test('should find OffTopicIntroMessage', () => {
            const wrapper = shallow(
                <ChannelIntroMessage
                    {...baseProps}
                    channel={offTopicChannel}
                />,
            ).children();
            expect(wrapper.prop('data-testid')).toBe(TestIds.offTopic);
        });
    });
});
