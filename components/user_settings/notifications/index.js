// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {updateMe} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import UserSettingsNotifications from './user_settings_notifications.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const sendPushNotifications = config.SendPushNotifications === 'true';
    const enableAutoResponder = config.ExperimentalEnableAutomaticReplies === 'true';

    return {
        sendPushNotifications,
        enableAutoResponder,
        isCollapsedThreadsEnabled: isCollapsedThreadsEnabled(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({updateMe}, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsNotifications);
