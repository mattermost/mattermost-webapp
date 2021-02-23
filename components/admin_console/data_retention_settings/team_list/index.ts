// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';
import {createSelector} from 'reselect';

import {getDataRetentionCustomPolicyTeams} from 'mattermost-redux/actions/admin';
import {searchTeams} from 'mattermost-redux/actions/teams';
import {getTeams} from 'mattermost-redux/selectors/entities/teams';
import {getDataRetentionCustomPolicy} from 'mattermost-redux/selectors/entities/admin';

import {ActionFunc} from 'mattermost-redux/types/actions';

import {TeamSearchOpts, TeamsWithCount} from 'mattermost-redux/types/teams';

import {GlobalState} from 'types/store';

import TeamList from './team_list';

type OwnProps = {
    match: {
        params: {
            policy_id: string;
        };
    };
}

type Actions = {
    searchTeams(term: string, opts: TeamSearchOpts): Promise<{data: TeamsWithCount}>;
    getDataRetentionCustomPolicyTeams(id: string, page: number, size: number): void;
}
const getSortedListOfTeams = createSelector(
    getTeams,
    (teams) => Object.values(teams).sort((a, b) => a.display_name.localeCompare(b.display_name)),
);

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const policyId = ownProps.match.params.policy_id;

    return {
        policyId,
        data: getSortedListOfTeams(state),
        total: state.entities.teams.totalCount || 0,
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
