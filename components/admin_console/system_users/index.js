// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTeams, getTeamStats} from 'mattermost-redux/actions/teams';
import {getUser, getUserAccessToken} from 'mattermost-redux/actions/users';
import {getTeamsList} from 'mattermost-redux/selectors/entities/teams';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {Stats} from 'mattermost-redux/constants';

import {setSystemUsersSearch} from 'actions/views/search';
import {SearchUserTeamFilter} from 'utils/constants.jsx';

import SystemUsers from './system_users.jsx';

function mapStateToProps(state) {
    const license = getLicense(state);
    const config = getConfig(state);

    const siteName = config.SiteName;
    const mfaEnabled = (license && license.IsLicensed === 'true' && license.MFA === 'true') &&
        config.EnableMultifactorAuthentication === 'true';
    const enableUserAccessTokens = config.EnableUserAccessTokens === 'true';
    const experimentalEnableAuthenticationTransfer = config.ExperimentalEnableAuthenticationTransfer === 'true';

    const search = state.views.search.systemUsersSearch;
    let totalUsers = 0;
    let searchTerm = '';
    let teamId = '';
    if (search) {
        searchTerm = search.term || '';
        teamId = search.team || '';

        if (!teamId || teamId === SearchUserTeamFilter.ALL_USERS) {
            const stats = state.entities.admin.analytics || {[Stats.TOTAL_USERS]: 0, [Stats.TOTAL_INACTIVE_USERS]: 0};
            totalUsers = stats[Stats.TOTAL_USERS] + stats[Stats.TOTAL_INACTIVE_USERS];
        } else if (teamId === SearchUserTeamFilter.NO_TEAM) {
            totalUsers = 0;
        } else {
            const stats = state.entities.teams.stats[teamId] || {total_member_count: 0};
            totalUsers = stats.total_member_count;
        }
    }

    return {
        teams: getTeamsList(state),
        siteName,
        mfaEnabled,
        totalUsers,
        searchTerm,
        teamId,
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
            setSystemUsersSearch,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUsers);
