// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getUser, getProfiles} from 'mattermost-redux/selectors/entities/users';
import {updateUserActive} from 'mattermost-redux/actions/users';

import SystemUserDetail from './system_user_detail.jsx';

function mapStateToProps(state, ownProps) {
    const userId = ownProps.match.params.user_id;
    const user = getUser(state, userId);
    return {
        userId,
        user,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getUser,
            getProfiles,
            updateUserActive,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUserDetail);