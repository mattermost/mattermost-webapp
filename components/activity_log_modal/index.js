// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getSessions, revokeSession} from 'mattermost-redux/actions/users';

import {getCurrentLocale} from 'selectors/i18n';

import ActivityLogModal from './activity_log_modal.jsx';

function mapStateToProps(state) {
    return {
        locale: getCurrentLocale(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getSessions,
            revokeSession,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivityLogModal);
