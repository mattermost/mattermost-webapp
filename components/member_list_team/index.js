// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeamStats} from 'mattermost-redux/actions/teams';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getMembersInCurrentTeam, getCurrentTeamStats} from 'mattermost-redux/selectors/entities/teams';
import {getProfilesInCurrentTeam, searchProfilesInCurrentTeam} from 'mattermost-redux/selectors/entities/users';
import {Permissions} from 'mattermost-redux/constants';
import {searchProfiles} from 'mattermost-redux/actions/users';

import {setModalSearchTerm} from 'actions/views/search';

import MemberListTeam from './member_list_team.jsx';

function mapStateToProps(state, ownProps) {
    const canManageTeamMembers = haveITeamPermission(state, {team: ownProps.teamId, permission: Permissions.MANAGE_TEAM_ROLES});

    const searchTerm = state.views.search.modalSearch;

    let users;
    if (searchTerm) {
        users = searchProfilesInCurrentTeam(state, searchTerm);
    } else {
        users = getProfilesInCurrentTeam(state);
    }

    const stats = getCurrentTeamStats(state) || {active_member_count: 0};

    return {
        searchTerm,
        users,
        teamMembers: getMembersInCurrentTeam(state) || {},
        currentTeamId: state.entities.teams.currentTeamId,
        totalTeamMembers: stats.active_member_count,
        canManageTeamMembers,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            searchProfiles,
            getTeamStats,
            setModalSearchTerm,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberListTeam);
