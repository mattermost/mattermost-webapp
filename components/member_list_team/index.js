// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeamStats} from 'mattermost-redux/actions/teams';
import {haveITeamPerm} from 'mattermost-redux/selectors/entities/roles';

import MemberListTeam from './member_list_team.jsx';

function mapStateToProps(state, ownProps) {
    const canManageTeamMembers = haveITeamPerm(state, {team: ownProps.teamId, perm: Permissions.MANAGE_TEAM_MEMBERS});
    return {
        canManageTeamMembers
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeamStats
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberListTeam);
