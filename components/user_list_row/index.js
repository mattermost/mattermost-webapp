// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getStatusForUserId} from 'mattermost-redux/selectors/entities/users';

import UserListRow from './user_list_row.jsx';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

function mapStateToProps(state, ownProps) {
    const user = ownProps.user || {};
    const config = getConfig(state);
    const loginWithCertificate = config.LoginWithCertificate === 'true';

    return {
        status: getStatusForUserId(state, user.id),
        loginWithCertificate,
    };
}

export default connect(mapStateToProps)(UserListRow);
