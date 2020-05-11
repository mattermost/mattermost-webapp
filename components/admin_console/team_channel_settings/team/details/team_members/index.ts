// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {Dictionary} from 'mattermost-redux/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';
import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {getTeamStats as loadTeamStats} from 'mattermost-redux/actions/teams';

import {getMembersInTeams, getTeamStats, getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getProfilesInTeam} from 'mattermost-redux/selectors/entities/users';

import {loadProfilesAndReloadTeamMembers, searchProfilesAndTeamMembers} from 'actions/user_actions.jsx';

import TeamMembers from './team_members';

type Props = {
    teamId: string;
    usersToAdd: Dictionary<UserProfile>;
    usersToRemove: Dictionary<UserProfile>;
};

type Actions = {
    getTeamStats: (teamId: string) => Promise<{
        data: boolean;
    }>;
    loadProfilesAndReloadTeamMembers: (page: number, perPage: number, teamId?: string, options?: {}) => Promise<{
        data: boolean;
    }>;
    searchProfilesAndTeamMembers: (term: string, options?: {}) => Promise<{
        data: boolean;
    }>;
};

function mapStateToProps(state: GlobalState, props: Props) {
    const {teamId, usersToAdd, usersToRemove} = props;
    const users = getProfilesInTeam(state, teamId);
    const teamMembers = getMembersInTeams(state)[teamId] || {};

    const team = getTeam(state, teamId);

    let stats = getTeamStats(state)[teamId];
    if (!stats) {
        stats = {
            total_member_count: 0,
            active_member_count: 0,
            team_id: '',
        };
    }

    return {
        teamId,
        team,
        users,
        teamMembers,
        usersToAdd,
        usersToRemove,
        totalCount: stats.total_member_count,
    };
}
function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getTeamStats: loadTeamStats,
            loadProfilesAndReloadTeamMembers,
            searchProfilesAndTeamMembers,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamMembers);
