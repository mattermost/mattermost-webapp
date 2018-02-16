// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import ChannelNotificationsModal from './channel_notifications_modal.jsx';

function mapStateToProps(state) {
    const config = state.entities.general.config;
    const sendPushNotifications = config.SendPushNotifications === 'true';

    return {
        sendPushNotifications
    };
}

export default connect(mapStateToProps)(ChannelNotificationsModal);
