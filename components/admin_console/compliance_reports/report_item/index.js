// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import ReportItem from './report_item.jsx';

function mapStateToProps(state, ownProps) {
    const report = ownProps.report || {};
    const user = getUser(state, report.user_id);
    return {
        email: user ? user.email : report.user_id,
    };
}

export default connect(mapStateToProps)(ReportItem);
