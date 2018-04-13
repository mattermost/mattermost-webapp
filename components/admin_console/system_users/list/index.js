// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getUser} from 'mattermost-redux/selectors/entities/users';

import SystemUsersList from './system_users_list.jsx';
import {getUsers} from './selectors.jsx';

function mapStateToProps(state, ownProps) {
    return {
        users: getUsers(state, ownProps.loading, ownProps.teamId, ownProps.term),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getUser,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUsersList);
