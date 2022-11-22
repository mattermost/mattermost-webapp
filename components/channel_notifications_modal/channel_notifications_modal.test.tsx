// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {shallow} from 'enzyme';

import {IgnoreChannelMentions, NotificationLevels} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';

import ChannelNotificationsModal from 'components/channel_notifications_modal/channel_notifications_modal';

import {UserNotifyProps} from '@mattermost/types/users';
import {ChannelMembership} from '@mattermost/types/channels';

describe('components/channel_notifications_modal/ChannelNotificationsModal', () => {
    const baseProps: ComponentProps<typeof ChannelNotificationsModal> = {
        onExited: jest.fn(),
        channel: TestHelper.getChannelMock({
            id: 'channel_id',
            display_name: 'channel_display_name',
        }),
        channelMember: {
            notify_props: {
                desktop: NotificationLevels.ALL,
                mark_unread: NotificationLevels.ALL,
                push: NotificationLevels.DEFAULT,
                ignore_channel_mentions: IgnoreChannelMentions.DEFAULT,
                desktop_threads: NotificationLevels.ALL,
                push_threads: NotificationLevels.DEFAULT,
            },
        } as unknown as ChannelMembership,
        currentUser: TestHelper.getUserMock({
            id: 'current_user_id',
            notify_props: {
                desktop: NotificationLevels.ALL,
                desktop_threads: NotificationLevels.ALL,
            } as UserNotifyProps,
        }),
        sendPushNotifications: true,
        actions: {
            updateChannelNotifyProps: jest.fn(),
        },
        collapsedReplyThreads: true,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ChannelNotificationsModal {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
