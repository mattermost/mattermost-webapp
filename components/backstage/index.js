// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam, getCurrentTeamMembership} from 'mattermost-redux/selectors/entities/teams';

import {isSystemAdmin, isAdmin as isTeamAdmin} from 'utils/utils.jsx';

import BackstageController from './backstage_controller.jsx';

function mapStateToProps(state) {
    const user = getCurrentUser(state);
    const team = getCurrentTeam(state);
    const teamMember = getCurrentTeamMembership(state);

    let isAdmin = false;
    if (user) {
        isAdmin = isSystemAdmin(user.roles);
    }

    if (teamMember) {
        isAdmin = isAdmin || isTeamAdmin(teamMember.roles);
    }

    return {
        user,
        team,
        isAdmin
    };
}

export default withRouter(connect(mapStateToProps)(BackstageController));
