// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import UserSettingsNotifications from './user_settings_notifications.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);

    const sendEmailNotifications = config.SendEmailNotifications === 'true';
    const enableEmailBatching = config.EnableEmailBatching === 'true';
    const siteName = config.SiteName;
    const sendPushNotifications = config.SendPushNotifications === 'true';

    return {
        ...ownProps,
        sendEmailNotifications,
        enableEmailBatching,
        siteName,
        sendPushNotifications
    };
}

export default connect(mapStateToProps)(UserSettingsNotifications);
