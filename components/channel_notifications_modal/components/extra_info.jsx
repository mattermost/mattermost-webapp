// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {NotificationSections} from 'utils/constants.jsx';

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
                    id='channel_notifications.unreadInfo'
                    defaultMessage='The channel name is bolded in the sidebar when there are unread messages. Selecting "Only for mentions" will bold the channel only when you are mentioned.'
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
