// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getTeams, getTeamStats} from 'mattermost-redux/actions/teams';
import {
    getUser,
    getUserAccessToken,
    getProfiles,
    searchProfiles,
    revokeSessionsForAllUsers,
} from 'mattermost-redux/actions/users';
import {logError} from 'mattermost-redux/actions/errors';
import {getTeamsList} from 'mattermost-redux/selectors/entities/teams';
import {getUsers} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {Stats} from 'mattermost-redux/constants';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import {loadProfilesAndTeamMembers, loadProfilesWithoutTeam} from 'actions/user_actions';

import {setSystemUsersSearch} from 'actions/views/search';
import {SearchUserTeamFilter} from 'utils/constants';

import SystemUsers from './system_users';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    const siteName = config.SiteName;
    const mfaEnabled = config.EnableMultifactorAuthentication === 'true';
    const enableUserAccessTokens = config.EnableUserAccessTokens === 'true';
    const experimentalEnableAuthenticationTransfer = config.ExperimentalEnableAuthenticationTransfer === 'true';

    const search = state.views.search.systemUsersSearch;
    let totalUsers = 0;
    let searchTerm = '';
    let teamId = '';
    let filter = '';
    if (search) {
        searchTerm = search.term || '';
        teamId = search.team || '';
        filter = search.filter || '';

        if (!teamId || teamId === SearchUserTeamFilter.ALL_USERS) {
            const stats = state.entities.admin.analytics || {[Stats.TOTAL_USERS]: 0, [Stats.TOTAL_INACTIVE_USERS]: 0};
            totalUsers = Number(stats[Stats.TOTAL_USERS]) + Number(stats[Stats.TOTAL_INACTIVE_USERS]);
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
        filter,
        enableUserAccessTokens,
        users: getUsers(state),
        experimentalEnableAuthenticationTransfer,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getTeams,
            getTeamStats,
            getUser,
            getUserAccessToken,
            loadProfilesAndTeamMembers,
            setSystemUsersSearch,
            loadProfilesWithoutTeam,
            getProfiles,
            searchProfiles,
            revokeSessionsForAllUsers,
            logError,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SystemUsers);
