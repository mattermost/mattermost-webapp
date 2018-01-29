// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {NotificationSections} from 'utils/constants.jsx';

export default function ExtraInfo({section}) {
    if (section === NotificationSections.DESKTOP) {
        return (
            <span>
                <FormattedMessage
                    id='channel_notifications.override'
                    defaultMessage='Selecting an option other than "Default" will override the global notification settings. Desktop notifications are available on Firefox, Safari, and Chrome.'
                />
            </span>
        );
    } else if (section === NotificationSections.PUSH) {
        return (
            <span>
                <FormattedMessage
                    id='channel_notifications.overridePush'
                    defaultMessage='Selecting an option other than "Global default" will override the global notification settings for mobile push notifications in account settings. Push notifications must be enabled by the System Admin.'
                />
            </span>
        );
    }

    return null;
}

ExtraInfo.propTypes = {
    section: PropTypes.string.isRequired
};
