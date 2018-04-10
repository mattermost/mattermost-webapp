// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeams, getTeamStats} from 'mattermost-redux/actions/teams';
import {getUser, getUserAccessToken} from 'mattermost-redux/actions/users';
import {getTeamsList, getTeamStats as selectTeamStats} from 'mattermost-redux/selectors/entities/teams';
import {getUsers} from 'mattermost-redux/selectors/entities/users';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import {StatTypes} from 'utils/constants.jsx';

import SystemUsers from './system_users.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    const siteName = config.SiteName;
    const mfaEnabled = (license && license.IsLicensed === 'true' && license.MFA === 'true') &&
        config.EnableMultifactorAuthentication === 'true';
    const enableUserAccessTokens = config.EnableUserAccessTokens === 'true';
    const experimentalEnableAuthenticationTransfer = config.ExperimentalEnableAuthenticationTransfer === 'true';

    return {
        users: getUsers(state),
        teams: getTeamsList(state),
        totalUsersOnSystem: state.entities.admin.analytics[StatTypes.TOTAL_USERS],
        teamStats: selectTeamStats(state),
        siteName,
        mfaEnabled,
        enableUserAccessTokens,
        experimentalEnableAuthenticationTransfer,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeams,
            getTeamStats,
            getUser,
            getUserAccessToken,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUsers);
