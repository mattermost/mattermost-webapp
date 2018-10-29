// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
    getProfiles,
    getProfilesInTeam,
    getStatusesByIds,
    getTotalUsersStats,
    searchProfiles,
} from 'mattermost-redux/actions/users';
import {
    getCurrentUserId,
    getProfiles as selectProfiles,
    getProfilesInCurrentChannel,
    getProfilesInCurrentTeam,
    searchProfiles as searchProfilesSelector,
    searchProfilesInCurrentTeam,
    getTotalUsersStats as getTotalUsersStatsSelector,
} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import {setModalSearchTerm} from 'actions/views/search';

import MoreDirectChannels from './more_direct_channels.jsx';

function mapStateToProps(state, ownProps) {
    let currentChannelMembers = [];
    if (ownProps.isExistingChannel) {
        currentChannelMembers = getProfilesInCurrentChannel(state);
    }

    const config = getConfig(state);
    const restrictDirectMessage = config.RestrictDirectMessage;

    const searchTerm = state.views.search.modalSearch;

    let users;
    if (searchTerm) {
        if (restrictDirectMessage === 'any') {
            users = searchProfilesSelector(state, searchTerm, false);
        } else {
            users = searchProfilesInCurrentTeam(state, searchTerm, false);
        }
    } else if (restrictDirectMessage === 'any') {
        users = selectProfiles(state);
    } else {
        users = getProfilesInCurrentTeam(state);
    }

    const team = getCurrentTeam(state);
    const stats = getTotalUsersStatsSelector(state) || {total_users_count: 0};

    return {
        currentTeamId: team.id,
        currentTeamName: team.name,
        searchTerm,
        users,
        statuses: state.entities.users.statuses,
        currentChannelMembers,
        currentUserId: getCurrentUserId(state),
        restrictDirectMessage,
        totalCount: stats.total_users_count,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getProfiles,
            getProfilesInTeam,
            getStatusesByIds,
            searchProfiles,
            setModalSearchTerm,
            getTotalUsersStats,
            loadStatusesForProfilesList,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoreDirectChannels);
