// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeams} from 'mattermost-redux/actions/teams';
import {withRouter} from 'react-router-dom';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {getIsLhsOpen} from 'selectors/lhs';

import TeamSidebar from './team_sidebar_controller.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    const enableTeamCreation = config.EnableTeamCreation === 'true';

    return {
        isOpen: getIsLhsOpen(state),
        experimentalPrimaryTeam,
        enableTeamCreation,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeams,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeamSidebar));
