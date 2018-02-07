// Copyright (c) 2017 Mattermost Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {haveITeamPerm} from 'mattermost-redux/selectors/entities/roles';

import TeamPermissionGate from './team_permission_gate.jsx';

function mapStateToProps(state, ownProps) {
    if (!ownProps.teamId) {
        return {hasPerm: false};
    }

    for (const perm of ownProps.perms) {
        if (haveITeamPerm(state, {team: ownProps.teamId, perm})) {
            return {hasPerm: true};
        }
    }

    return {hasPerm: false};
}

export default connect(mapStateToProps)(TeamPermissionGate);
