// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import ChannelNotificationsModal from './channel_notifications_modal.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const sendPushNotifications = config.SendPushNotifications === 'true';

    return {
        sendPushNotifications,
    };
}

export default connect(mapStateToProps)(ChannelNotificationsModal);
