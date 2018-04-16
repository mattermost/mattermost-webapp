// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {NotificationLevels, NotificationSections} from 'utils/constants.jsx';

export default function Describe({section, memberNotifyLevel, globalNotifyLevel}) {
    if (memberNotifyLevel === NotificationLevels.DEFAULT && globalNotifyLevel) {
        return (
            <FormattedMessage
                id='channel_notifications.globalDefault'
                defaultMessage='Global default ({notifyLevel})'
                values={{
                    notifyLevel: (globalNotifyLevel),
                }}
            />
        );
    } else if (memberNotifyLevel === NotificationLevels.MENTION && section === NotificationSections.MARK_UNREAD) {
        return (
            <FormattedMessage
                id='channel_notifications.muteChannel.on.title'
                defaultMessage='On'
            />
        );
    } else if (memberNotifyLevel === NotificationLevels.MENTION) {
        return (
            <FormattedMessage
                id='channel_notifications.onlyMentions'
                defaultMessage='Only for mentions'
            />
        );
    } else if (
        (section === NotificationSections.DESKTOP || section === NotificationSections.PUSH) &&
        memberNotifyLevel === NotificationLevels.ALL
    ) {
        return (
            <FormattedMessage
                id='channel_notifications.allActivity'
                defaultMessage='For all activity'
            />
        );
    } else if (
        section === NotificationSections.MARK_UNREAD &&
        memberNotifyLevel === NotificationLevels.ALL
    ) {
        return (
            <FormattedMessage
                id='channel_notifications.muteChannel.off.title'
                defaultMessage='Off'
            />
        );
    }

    return (
        <FormattedMessage
            id='channel_notifications.never'
            defaultMessage='Never'
        />
    );
}

Describe.propTypes = {
    globalNotifyLevel: PropTypes.string,
    memberNotifyLevel: PropTypes.string.isRequired,
    section: PropTypes.string.isRequired,
};
