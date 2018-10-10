// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import SystemUsersDropdown from './system_users_dropdown.jsx';

function mapStateToProps(state) {
    const team = getCurrentTeam(state);
    let teamUrl;
    if (team) {
        teamUrl = '/' + team.name;
    }

    return {
        currentUser: getCurrentUser(state),
        teamUrl,
    };
}

export default connect(mapStateToProps)(SystemUsersDropdown);
