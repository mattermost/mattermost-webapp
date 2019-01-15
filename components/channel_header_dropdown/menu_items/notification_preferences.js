
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Constants, ModalIdentifiers} from 'utils/constants';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ChannelNotificationsModal from 'components/channel_notifications_modal';

const NotificationPreferences = ({user, channel, isArchived}) => {
    if (channel.type === Constants.DM_CHANNEL) {
        return null;
    }

    if (isArchived) {
        return null;
    }

    return (
        <li role='presentation'>
            <ToggleModalButtonRedux
                id='channelNotifications'
                role='menuitem'
                modalId={ModalIdentifiers.CHANNEL_NOTIFICATIONS}
                dialogType={ChannelNotificationsModal}
                dialogProps={{
                    channel,
                    currentUser: user,
                }}
            >
                <FormattedMessage
                    id='navbar.preferences'
                    defaultMessage='Notification Preferences'
                />
            </ToggleModalButtonRedux>
        </li>
    );
};

NotificationPreferences.propTypes = {

    /**
     * Object with info about user
     */
    user: PropTypes.object.isRequired,

    /**
     * Object with info about channel
     */
    channel: PropTypes.object.isRequired,

    /**
     * Boolean whether the current channel is archived
     */
    isArchived: PropTypes.bool.isRequired,
};

export default NotificationPreferences;
