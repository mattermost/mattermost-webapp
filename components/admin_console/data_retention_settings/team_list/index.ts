// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {createSelector} from 'reselect';

import {getDataRetentionCustomPolicyTeams} from 'mattermost-redux/actions/admin';
import {searchTeams} from 'mattermost-redux/actions/teams';
import {getTeamsInPolicy} from 'mattermost-redux/selectors/entities/teams';
import {getDataRetentionCustomPolicy} from 'mattermost-redux/selectors/entities/admin';

import {ActionFunc} from 'mattermost-redux/types/actions';

import {Team, TeamSearchOpts, TeamsWithCount} from 'mattermost-redux/types/teams';

import {GlobalState} from 'types/store';

import TeamList from './team_list';

type OwnProps = {
    policyId: string;
}

type Actions = {
    searchTeams: (term: string, opts: TeamSearchOpts) => Promise<{data: TeamsWithCount}>;
    getDataRetentionCustomPolicyTeams: (id: string, page: number, perPage: number) => Promise<{ data: Team[] }>;
}
const getSortedListOfTeams = createSelector(
    getTeamsInPolicy,
    (teams) => Object.values(teams).sort((a, b) => a.display_name.localeCompare(b.display_name)),
);

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const teams = ownProps.policyId ? getSortedListOfTeams(state) : [];
    const policy = ownProps.policyId ? getDataRetentionCustomPolicy(state, ownProps.policyId) || {} : {};
    let totalCount = 0;

    if (policy && policy.team_count) {
        totalCount = policy.team_count;
    }
    return {
        teams,
        totalCount,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getDataRetentionCustomPolicyTeams,
            searchTeams,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamList);
