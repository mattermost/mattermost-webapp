// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';

import TeamPermissionGate from './team_permission_gate.jsx';

function mapStateToProps(state, ownProps) {
    if (!ownProps.teamId) {
        return {hasPermission: false};
    }

    for (const permission of ownProps.permissions) {
        if (haveITeamPermission(state, {team: ownProps.teamId, permission})) {
            return {hasPermission: true};
        }
    }

    return {hasPermission: false};
}

export default connect(mapStateToProps)(TeamPermissionGate);
