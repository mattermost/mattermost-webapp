// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {updateUserActive} from 'mattermost-redux/actions/users';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import SystemUsersDropdown from './system_users_dropdown.jsx';

function mapStateToProps(state) {
    return {
        currentUser: getCurrentUser(state),
        teamUrl: getCurrentRelativeTeamUrl(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({updateUserActive}, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUsersDropdown);
