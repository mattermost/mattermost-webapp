// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {GlobalState} from 'mattermost-redux/types/store';

import {getTeamStats as loadTeamStats} from 'mattermost-redux/actions/teams';
import {getTeamStats} from 'mattermost-redux/selectors/entities/teams'
import {loadProfilesAndTeamMembers} from 'actions/user_actions.jsx';

import {getProfilesInTeam} from 'mattermost-redux/selectors/entities/users';

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
    const teamId = props.teamId;
    const users = getProfilesInTeam(state, teamId);
    const stats = getTeamStats(state)[teamId];

    return {
        stats,
        users,
        total: 0,
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
