// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {t} from 'utils/i18n';
import {FieldsetCheckbox} from 'components/widgets/modals/generic/checkbox-item-creator';

import {FieldsetRadio} from '../widgets/modals/generic/radio-item-creator';
import {NotificationLevels} from '../../utils/constants';
import {ChannelNotifyProps} from '@mattermost/types/channels';
import {UserNotifyProps} from '@mattermost/types/users';

export type ChannelMemberNotifyProps = Partial<ChannelNotifyProps> & Pick<UserNotifyProps, 'desktop_threads' | 'push_threads'>

export const MuteAndIgnoreSectionTitle = {
    id: t('channel_notifications.muteAndIgnore'),
    defaultMessage: 'Mute or ignore',
};

export const NotifyMeTitle = {
    id: t('channel_notifications.NotifyMeTitle'),
    defaultMessage: 'Notify me about…',
};

export const ThreadsReplyTitle = {
    id: t('channel_notifications.ThreadsReplyTitle'),
    defaultMessage: 'Thread reply notifications',
};

export const DesktopNotificationsSectionTitle = {
    id: t('channel_notifications.desktopNotificationsTitle'),
    defaultMessage: 'Desktop Notifications',
};

export const DesktopNotificationsSectionDesc = {
    id: t('channel_notifications.desktopNotificationsDesc'),
    defaultMessage: 'Available on Chrome, Edge, Firefox, and the Mattermost Desktop App.',
};

export const MobileNotificationsSectionTitle = {
    id: t('channel_notifications.mobileNotificationsTitle'),
    defaultMessage: 'Mobile Notifications',
};

export const MobileNotificationsSectionDesc = {
    id: t('channel_notifications.mobileNotificationsDesc'),
    defaultMessage: 'Notification alerts are pushed to your mobile device when there is activity in Mattermost.',
};

export const MuteChannelDesc = {
    id: t('channel_notifications.muteChannelDesc'),
    defaultMessage: 'Turns off notifications for this channel. You’ll still see badges if you’re mentioned.',
};
export const IgnoreMentionsDesc = {
    id: t('channel_notifications.ignoreMentionsDesc'),
    defaultMessage: 'When enabled, @channel, @here and @all will not trigger mentions or mention notifications in this channel',
};

export const MuteChannelInputFieldData: FieldsetCheckbox = {
    title: {
        id: t('channel_notifications.muteChannelTitle'),
        defaultMessage: 'Mute channel',
    },
    name: 'mute channel',
    dataTestId: 'muteChannel',
};

export const DesktopReplyThreadsInputFieldData: FieldsetCheckbox = {
    title: {
        id: t('channel_notifications.checkbox.threadsReplyTitle'),
        defaultMessage: 'Notify me about replies to threads I’m following',
    },
    name: 'desktop reply threads',
    dataTestId: 'desktopReplyThreads',
};

export const MobileReplyThreadsInputFieldData: FieldsetCheckbox = {
    title: {
        id: t('channel_notifications.checkbox.threadsReplyTitle'),
        defaultMessage: 'Notify me about replies to threads I’m following',
    },
    name: 'mobile reply threads',
    dataTestId: 'mobileReplyThreads',
};

export const IgnoreMentionsInputFieldData: FieldsetCheckbox = {
    title: {
        id: t('channel_notifications.ignoreMentionsTitle'),
        defaultMessage: 'Ignore mentions for @channel, @here and @all',
    },
    name: 'ignore mentions',
    dataTestId: 'ignoreMentions',
};

export const AutoFollowThreadsTitle = {
    id: t('channel_notifications.autoFollowThreadsTitle'),
    defaultMessage: 'Follow all threads in this channel',
};

export const AutoFollowThreadsDesc = {
    id: t('channel_notifications.autoFollowThreadsDesc'),
    defaultMessage: 'When enabled, all new replies in this channel will be automatically followed and will appear in your Threads view.',
};

export const AutoFollowThreadsInputFieldData: FieldsetCheckbox = {
    title: {
        id: t('channel_notifications.checkbox.autoFollowThreadsTitle'),
        defaultMessage: 'Automatically follow threads in this channel',
    },
    name: 'auto follow threads',
    dataTestId: 'autoFollowThreads',
};

export const desktopNotificationInputFieldData: FieldsetRadio = {
    options: [
        {
            dataTestId: `desktopNotification-${NotificationLevels.DEFAULT}`,
            title: {
                id: 'channel_notifications.desktopNotificationDefaultLabel',
                defaultMessage: 'Global default (Mention)',
            },
            name: `desktopNotification-${NotificationLevels.DEFAULT}`,
            key: `desktopNotification-${NotificationLevels.DEFAULT}`,
            value: NotificationLevels.DEFAULT,
        },
        {
            dataTestId: `desktopNotification-${NotificationLevels.ALL}`,
            title: {
                id: 'channel_notifications.desktopNotificationAllLabel',
                defaultMessage: 'All new messages',
            },
            name: `desktopNotification-${NotificationLevels.ALL}`,
            key: `desktopNotification-${NotificationLevels.ALL}`,
            value: NotificationLevels.ALL,
        },
        {
            dataTestId: `desktopNotification-${NotificationLevels.MENTION}`,
            title: {
                id: 'channel_notifications.desktopNotificationMentionLabel',
                defaultMessage: 'Mentions, direct messages, and keywords only (default)',
            },
            name: `desktopNotification-${NotificationLevels.MENTION}`,
            key: `desktopNotification-${NotificationLevels.MENTION}`,
            value: NotificationLevels.MENTION,
        },
        {
            dataTestId: `desktopNotification-${NotificationLevels.NONE}`,
            title: {
                id: 'channel_notifications.desktopNotificationNothingLabel',
                defaultMessage: 'Nothing',
            },
            name: `desktopNotification-${NotificationLevels.NONE}`,
            key: `desktopNotification-${NotificationLevels.NONE}`,
            value: NotificationLevels.NONE,
        },
    ],
};

export const MobileNotificationInputFieldData: FieldsetRadio = {
    options: [
        {
            dataTestId: `MobileNotification-${NotificationLevels.DEFAULT}`,
            title: {
                id: 'channel_notifications.MobileNotificationDefaultLabel',
                defaultMessage: 'Global default (Mention)',
            },
            name: `MobileNotification-${NotificationLevels.DEFAULT}`,
            key: `MobileNotification-${NotificationLevels.DEFAULT}`,
            value: NotificationLevels.DEFAULT,
        },
        {
            dataTestId: `MobileNotification-${NotificationLevels.ALL}`,
            title: {
                id: 'channel_notifications.MobileNotificationAllLabel',
                defaultMessage: 'All new messages',
            },
            name: `MobileNotification-${NotificationLevels.ALL}`,
            key: `MobileNotification-${NotificationLevels.ALL}`,
            value: NotificationLevels.ALL,
        },
        {
            dataTestId: `MobileNotification-${NotificationLevels.MENTION}`,
            title: {
                id: 'channel_notifications.MobileNotificationMentionLabel',
                defaultMessage: 'Mentions, direct messages, and keywords only (default)',
            },
            name: `MobileNotification-${NotificationLevels.MENTION}`,
            key: `MobileNotification-${NotificationLevels.MENTION}`,
            value: NotificationLevels.MENTION,
        },
        {
            dataTestId: `MobileNotification-${NotificationLevels.NONE}`,
            title: {
                id: 'channel_notifications.MobileNotificationNothingLabel',
                defaultMessage: 'Nothing',
            },
            name: `MobileNotification-${NotificationLevels.NONE}`,
            key: `MobileNotification-${NotificationLevels.NONE}`,
            value: NotificationLevels.NONE,
        },
    ],
};

