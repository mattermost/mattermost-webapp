// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import {AnnouncementBarMessages} from 'utils/constants';
import {dismissNotice} from 'actions/views/notice';
import {getSiteURL} from 'utils/url';

import ConfigurationBar from './configuration_bar';

function mapStateToProps(state: GlobalState) {
    return {
        siteURL: getSiteURL(),
        dismissedExpiringLicense: Boolean(state.views.notice.hasBeenDismissed[AnnouncementBarMessages.LICENSE_EXPIRING]),
        dismissedNumberOfActiveUsersWarnMetricStatus: Boolean(state.views.notice.hasBeenDismissed[AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_USERS]),
        dismissedNumberOfActiveUsersWarnMetricStatusAck: Boolean(state.views.notice.hasBeenDismissed[AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_USERS_ACK]),
        dismissedNumberOfPostsWarnMetricStatus: Boolean(state.views.notice.hasBeenDismissed[AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_POSTS]),
        dismissedNumberOfPostsWarnMetricStatusAck: Boolean(state.views.notice.hasBeenDismissed[AnnouncementBarMessages.WARN_METRIC_STATUS_NUMBER_OF_POSTS_ACK]),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            dismissNotice,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigurationBar);
