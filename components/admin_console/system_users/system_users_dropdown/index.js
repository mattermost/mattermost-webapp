// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import SystemUsersDropdown from './system_users_dropdown.jsx';

function mapStateToProps(state) {
    return {
        currentUser: getCurrentUser(state),
        teamUrl: getCurrentRelativeTeamUrl(state),
    };
}

export default connect(mapStateToProps)(SystemUsersDropdown);
