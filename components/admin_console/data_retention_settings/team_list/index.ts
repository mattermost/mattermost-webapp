// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {createSelector} from 'reselect';

import {getDataRetentionCustomPolicyTeams, searchDataRetentionCustomPolicyTeams, clearDataRetentionCustomPolicyTeams} from 'mattermost-redux/actions/admin';
import {getTeamsInPolicy, searchTeamsInPolicy} from 'mattermost-redux/selectors/entities/teams';
import {getDataRetentionCustomPolicy} from 'mattermost-redux/selectors/entities/admin';
import {teamListToMap, filterTeamsStartingWithTerm} from 'mattermost-redux/utils/team_utils';

import {ActionFunc, ActionResult} from 'mattermost-redux/types/actions';

import {Team, TeamSearchOpts, TeamsWithCount} from 'mattermost-redux/types/teams';

import {GlobalState} from 'types/store';
import {setTeamListSearch} from 'actions/views/search';
import TeamList from './team_list';
import { Dictionary } from 'mattermost-redux/types/utilities';

type OwnProps = {
    policyId: string;
    teamsToAdd: Dictionary<Team>;
}

type Actions = {
    getDataRetentionCustomPolicyTeams: (id: string, page: number, perPage: number) => Promise<{ data: Team[] }>;
    searchDataRetentionCustomPolicyTeams: (id: string, term: string, opts: TeamSearchOpts) => Promise<{ data: Team[] }>;
    clearDataRetentionCustomPolicyTeams: () => {data: {}};
    setTeamListSearch: (term: string) => ActionResult;
}
const getSortedListOfTeams = createSelector(
    getTeamsInPolicy,
    (teams) => Object.values(teams).sort((a, b) => a.display_name.localeCompare(b.display_name)),
);

function searchTeamsToAdd(teams: Dictionary<Team>, term: string): Dictionary<Team> {
    const filteredTeams = filterTeamsStartingWithTerm(Object.keys(teams).map((key) => teams[key]), term);
    return teamListToMap(filteredTeams);
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    let {teamsToAdd} = ownProps;

    let teams: Team[] = [];
    const policy = ownProps.policyId ? getDataRetentionCustomPolicy(state, ownProps.policyId) || {} : {};
    let totalCount = 0;
    let searchTerm = state.views.search.teamListSearch || '';

    if (searchTerm) {
        teams = searchTeamsInPolicy(state, searchTerm) || [];
        teamsToAdd = searchTeamsToAdd(teamsToAdd, searchTerm);
        totalCount = teams.length;
    } else {
        teams = ownProps.policyId ? getSortedListOfTeams(state) : [];
        if (policy && policy.team_count) {
            totalCount = policy.team_count;
        }
    }
    
    return {
        teams,
        totalCount,
        searchTerm,
        teamsToAdd,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getDataRetentionCustomPolicyTeams,
            searchTeams: searchDataRetentionCustomPolicyTeams,
            clearDataRetentionCustomPolicyTeams,
            setTeamListSearch
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamList);
