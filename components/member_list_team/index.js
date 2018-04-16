// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeamStats} from 'mattermost-redux/actions/teams';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';

import MemberListTeam from './member_list_team.jsx';

function mapStateToProps(state, ownProps) {
    const canManageTeamMembers = haveITeamPermission(state, {team: ownProps.teamId, permission: Permissions.MANAGE_TEAM_ROLES});
    return {
        canManageTeamMembers,
        ...ownProps,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeamStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberListTeam);
