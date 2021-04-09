// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getMyNotifications, getMyNotificationCounts} from 'mattermost-redux/actions/notifications';
import {GenericAction} from 'mattermost-redux/types/actions';

import AppBar from './app_bar';

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getMyNotificationCounts,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(AppBar);
