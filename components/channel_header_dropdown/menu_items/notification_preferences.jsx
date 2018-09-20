
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ChannelNotificationsModal from 'components/channel_notifications_modal';
import {ModalIdentifiers} from 'utils/constants';

const NotificationPreferences = ({user, channel, membership}) => (
    <li role='presentation'>
        <ToggleModalButtonRedux
            role='menuitem'
            modalId={ModalIdentifiers.CHANNEL_NOTIFICATIONS}
            dialogType={ChannelNotificationsModal}
            dialogProps={{
                channel,
                channelMember: membership,
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
     * Object with info about user's channel membership
     */
    membership: PropTypes.object.isRequired,
};

export default NotificationPreferences;
