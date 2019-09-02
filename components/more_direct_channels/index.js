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
import {searchGroupChannels} from 'mattermost-redux/actions/channels';
import {
    getCurrentUserId,
    getProfiles as selectProfiles,
    getProfilesInCurrentChannel,
    getProfilesInCurrentTeam, searchProfiles as searchProfilesSelector,
    searchProfilesInCurrentTeam,
    getTotalUsersStats as getTotalUsersStatsSelector,
} from 'mattermost-redux/selectors/entities/users';
import {getChannelsWithUserProfiles} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {filterProfilesMatchingTerm} from 'mattermost-redux/utils/user_utils';
import {memoizeResult} from 'mattermost-redux/utils/helpers';

import {openDirectChannelToUserId, openGroupChannelToUserIds} from 'actions/channel_actions';
import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import {loadProfilesForGroupChannels} from 'actions/user_actions';
import {setModalSearchTerm} from 'actions/views/search';

import MoreDirectChannels from './more_direct_channels.jsx';

function mapStateToProps(state, ownProps) {
    const currentUserId = getCurrentUserId(state);
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

    const filteredGroupChannels = filterGroupChannels(getChannelsWithUserProfiles(state), searchTerm);

    const team = getCurrentTeam(state);
    const stats = getTotalUsersStatsSelector(state) || {total_users_count: 0};

    return {
        currentTeamId: team.id,
        currentTeamName: team.name,
        searchTerm,
        users,
        groupChannels: filteredGroupChannels,
        statuses: state.entities.users.statuses,
        currentChannelMembers,
        currentUserId,
        restrictDirectMessage,
        totalCount: stats.total_users_count,
    };
}

const filterGroupChannels = memoizeResult((channels, term) => {
    return channels.filter((channel) => {
        const matches = filterProfilesMatchingTerm(channel.profiles, term);
        return matches.length > 0;
    });
});

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getProfiles,
            getProfilesInTeam,
            getStatusesByIds,
            getTotalUsersStats,
            loadStatusesForProfilesList,
            loadProfilesForGroupChannels,
            openDirectChannelToUserId,
            openGroupChannelToUserIds,
            searchProfiles,
            searchGroupChannels,
            setModalSearchTerm,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoreDirectChannels);
