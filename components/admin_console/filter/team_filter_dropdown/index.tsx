// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {createSelector} from 'reselect';

import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {TeamSearchOpts} from 'mattermost-redux/types/teams';
import {getTeams as fetchTeams, searchTeams} from 'mattermost-redux/actions/teams';
import {getTeams} from 'mattermost-redux/selectors/entities/teams';

import {GlobalState} from 'types/store';

import TeamFilterDropdown from './team_filter_dropdown';

const getSortedListOfTeams = createSelector(
    getTeams,
    (teams) => Object.values(teams).sort((a, b) => a.display_name.localeCompare(b.display_name)),
);

type Actions = {
    getData: (page: number, perPage: number) => Promise<{ data: any }>;
    searchTeams: (term: string, opts: TeamSearchOpts) => Promise<{ data: any }>;
};

function mapStateToProps(state: GlobalState) {
    return {
        teams: getSortedListOfTeams(state),
        total: state.entities.teams.totalCount || 0,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getData: (page, pageSize) => fetchTeams(page, pageSize, true),
            searchTeams,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamFilterDropdown);
