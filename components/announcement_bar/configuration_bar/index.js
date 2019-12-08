// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {AnnouncementBarMessages} from 'utils/constants';
import {dismissNotice} from 'actions/views/notice';
import {getSiteURL} from 'utils/url';

import ConfigurationBar from './configuration_bar.jsx';

function mapStateToProps(state) {
    return {
        siteURL: getSiteURL(state),
        dismissedExpiringLicense: Boolean(state.views.notice.hasBeenDismissed[AnnouncementBarMessages.LICENSE_EXPIRING]),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            dismissNotice,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigurationBar);
