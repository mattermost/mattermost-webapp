// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';

import {getTeams as fetchTeams, searchTeams} from 'mattermost-redux/actions/teams';
import {getTeams} from 'mattermost-redux/selectors/entities/teams';

import {t} from 'utils/i18n';

import TeamList from './team_list.jsx';

const getSortedListOfTeams = createSelector(
    getTeams,
    (teams) => Object.values(teams).sort((a, b) => a.display_name.localeCompare(b.display_name))
);

function mapStateToProps(state) {
    return {
        data: getSortedListOfTeams(state),
        total: state.entities.teams.totalCount || 0,
        emptyListTextId: t('admin.team_settings.team_list.no_teams_found'),
        emptyListTextDefaultMessage: 'No teams found',
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getData: (page, pageSize) => fetchTeams(page, pageSize, true),
            searchTeams,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamList);
