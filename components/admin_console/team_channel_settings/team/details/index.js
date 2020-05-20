// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';

import {getTeam} from 'mattermost-redux/selectors/entities/teams';

import {getTeam as fetchTeam, membersMinusGroupMembers, patchTeam, removeUserFromTeam, updateTeamMemberSchemeRoles, addUserToTeam} from 'mattermost-redux/actions/teams';
import {getAllGroups, getGroupsAssociatedToTeam} from 'mattermost-redux/selectors/entities/groups';

import {
    getGroupsAssociatedToTeam as fetchAssociatedGroups,
    linkGroupSyncable,
    unlinkGroupSyncable,
    patchGroupSyncable,
} from 'mattermost-redux/actions/groups';

import {connect} from 'react-redux';

import {setNavigationBlocked} from 'actions/admin_actions';

import TeamDetails from './team_details';

function mapStateToProps(state, props) {
    const teamID = props.match.params.team_id;
    const team = getTeam(state, teamID);
    const groups = getGroupsAssociatedToTeam(state, teamID);
    const allGroups = getAllGroups(state, teamID);
    const totalGroups = groups.length;
    return {
        team,
        groups,
        totalGroups,
        allGroups,
        teamID,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeam: fetchTeam,
            getGroups: fetchAssociatedGroups,
            patchTeam,
            linkGroupSyncable,
            unlinkGroupSyncable,
            membersMinusGroupMembers,
            setNavigationBlocked,
            patchGroupSyncable,
            removeUserFromTeam,
            addUserToTeam,
            updateTeamMemberSchemeRoles,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamDetails);
