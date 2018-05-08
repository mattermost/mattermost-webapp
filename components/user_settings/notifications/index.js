// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import UserSettingsNotifications from './user_settings_notifications.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const enableEmailBatching = config.EnableEmailBatching === 'true';
    const siteName = config.SiteName;
    const sendPushNotifications = config.SendPushNotifications === 'true';
    const enableAutoResponder = config.ExperimentalEnableAutomaticReplies === 'true';

    return {
        sendEmailNotifications,
        enableEmailBatching,
        siteName,
        sendPushNotifications,
        enableAutoResponder,
    };
}

export default connect(mapStateToProps)(UserSettingsNotifications);
