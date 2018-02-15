// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getSessions, revokeSession} from 'mattermost-redux/actions/users';

import ActivityLogModal from './activity_log_modal.jsx';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getSessions,
        revokeSession
    }, dispatch)
});

export default connect(null, mapDispatchToProps)(ActivityLogModal);
