// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';

import {getTeamStats as loadTeamStats} from 'mattermost-redux/actions/teams';

import {getMembersInTeams, getTeamStats, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getProfilesInTeam} from 'mattermost-redux/selectors/entities/users';

import {loadProfilesAndTeamMembers} from 'actions/user_actions.jsx';

import TeamMembers from './team_members';

type Props = {
    teamId: string;
};

type Actions = {
    getTeamStats: (teamId: string) => Promise<{
        data: boolean;
    }>;
    loadProfilesAndTeamMembers: (page: number, perPage: number, teamId?: string, options?: {}) => Promise<{
        data: boolean;
    }>;
};

function mapStateToProps(state: GlobalState, props: Props) {
    const {teamId} = props;
    const users = getProfilesInTeam(state, teamId);
    const teamMembers = getMembersInTeams(state)[teamId] || {};

    let stats = getTeamStats(state)[teamId];
    if (!stats) {
        stats = {
            total_member_count: 0,
            active_member_count: 0,
            team_id: '',
        };
    }

    return {
        stats,
        users,
        teamMembers,
    };
}
function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getTeamStats: loadTeamStats,
            loadProfilesAndTeamMembers,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamMembers);
