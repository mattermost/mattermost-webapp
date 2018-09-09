
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {ModalIdentifiers} from 'utils/constants';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ChannelNotificationsModal from 'components/channel_notifications_modal';

const NotificationPreferencesOption = ({user, channel, membership}) => (
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

NotificationPreferencesOption.propTypes = {
    user: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    membership: PropTypes.object.isRequired,
};

export default NotificationPreferencesOption;
