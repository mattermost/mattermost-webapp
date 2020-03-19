// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeams} from 'mattermost-redux/actions/teams';
import {withRouter} from 'react-router-dom';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getMyTeams, getJoinableTeamIds, getTeamMemberships, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {getCurrentLocale} from 'selectors/i18n';
import {getIsLhsOpen} from 'selectors/lhs';
import {switchTeam, updateTeamsOrderForUser} from 'actions/team_actions.jsx';
import {Preferences} from 'utils/constants.jsx';

import LegacyTeamSidebar from './legacy_team_sidebar_controller.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const experimentalPrimaryTeam = config.ExperimentalPrimaryTeam;
    const joinableTeams = getJoinableTeamIds(state);
    const moreTeamsToJoin = joinableTeams && joinableTeams.length > 0;

    return {
        currentTeamId: getCurrentTeamId(state),
        myTeams: getMyTeams(state),
        myTeamMembers: getTeamMemberships(state),
        isOpen: getIsLhsOpen(state),
        experimentalPrimaryTeam,
        locale: getCurrentLocale(state),
        moreTeamsToJoin,
        userTeamsOrderPreference: get(state, Preferences.TEAMS_ORDER, '', ''),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeams,
            switchTeam,
            updateTeamsOrderForUser,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LegacyTeamSidebar));
