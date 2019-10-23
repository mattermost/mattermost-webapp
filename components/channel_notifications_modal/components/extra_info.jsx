// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {NotificationSections} from 'utils/constants';

export default function ExtraInfo({section}) {
    switch (section) {
    case NotificationSections.DESKTOP:
        return (
            <span>
                <FormattedMessage
                    id='channel_notifications.override'
                    defaultMessage='Selecting an option other than "Default" will override the global notification settings. Desktop notifications are available on Firefox, Safari, and Chrome.'
                />
            </span>
        );
    case NotificationSections.PUSH:
        return (
            <span>
                <FormattedMessage
                    id='channel_notifications.overridePush'
                    defaultMessage='Selecting an option other than "Global default" will override the global notification settings for mobile push notifications in account settings. Push notifications must be enabled by the System Admin.'
                />
            </span>
        );
    case NotificationSections.MARK_UNREAD:
        return (
            <span>
                <FormattedMessage
                    id='channel_notifications.muteChannel.help'
                    defaultMessage='Muting turns off desktop, email and push notifications for this channel. The channel will not be marked as unread unless you are mentioned.'
                />
            </span>
        );
    case NotificationSections.IGNORE_CHANNEL_MENTIONS:
        return (
            <span>
                <FormattedMessage
                    id='channel_notifications.ignoreChannelMentions.help'
                    defaultMessage='When enabled, @channel, @here and @all will not trigger mentions or mention notifications in this channel.'
                />
            </span>
        );
    default:
        return null;
    }
}

ExtraInfo.propTypes = {
    section: PropTypes.string.isRequired,
};
