// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {updateChannelNotifyProps} from 'mattermost-redux/actions/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import ChannelNotificationsModal from './channel_notifications_modal.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const sendPushNotifications = config.SendPushNotifications === 'true';

    return {
        sendPushNotifications,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            updateChannelNotifyProps,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelNotificationsModal);
