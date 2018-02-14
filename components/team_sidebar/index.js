// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeams} from 'mattermost-redux/actions/teams';
import {withRouter} from 'react-router-dom';

import TeamSidebar from './team_sidebar_controller.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;

    const experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    const enableTeamCreation = config.EnableTeamCreation === 'true';

    return {
        ...ownProps,
        experimentalPrimaryTeam,
        enableTeamCreation
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeams
        }, dispatch)
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeamSidebar));
