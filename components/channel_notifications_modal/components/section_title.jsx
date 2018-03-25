// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {NotificationSections} from 'utils/constants.jsx';

export default function SectionTitle({section}) {
    if (section === NotificationSections.DESKTOP) {
        return (
            <FormattedMessage
                id='channel_notifications.sendDesktop'
                defaultMessage='Send desktop notifications'
            />
        );
    } else if (section === NotificationSections.PUSH) {
        return (
            <FormattedMessage
                id='channel_notifications.push'
                defaultMessage='Send mobile push notifications'
            />
        );
    } else if (section === NotificationSections.MARK_UNREAD) {
        return (
            <FormattedMessage
                id='channel_notifications.muteChannel.settings'
                defaultMessage='Mute Channel'
            />
        );
    }

    return null;
}

SectionTitle.propTypes = {
    section: PropTypes.string.isRequired,
};
