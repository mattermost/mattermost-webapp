// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GlobalState} from 'types/store';
import {enableBrowserNotifications} from 'actions/notification_actions';

import {isNotificationsPermissionGranted} from 'selectors/browser';

import DesktopNotificationSettings from './desktop_notification_settings';

function mapStateToProps(state: GlobalState) {
    const areNotificationsDisabled = !isNotificationsPermissionGranted(state);

    return {
        areNotificationsDisabled,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            enableBrowserNotifications,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DesktopNotificationSettings);
