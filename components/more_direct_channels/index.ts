// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, ActionCreatorsMapObject, Dispatch} from 'redux';
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
    getUser,
} from 'mattermost-redux/selectors/entities/users';

import {getChannelsWithUserProfiles, getAllChannels} from 'mattermost-redux/selectors/entities/channels';
import {getUserIdFromChannelName} from 'mattermost-redux/utils/channel_utils';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';
import {sortByUsername, filterProfilesMatchingTerm} from 'mattermost-redux/utils/user_utils';
import {memoizeResult} from 'mattermost-redux/utils/helpers';

import {RelationOneToOne} from 'mattermost-redux/types/utilities';

import {Constants} from 'utils/constants';
import {openDirectChannelToUserId, openGroupChannelToUserIds} from 'actions/channel_actions';
import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import {loadProfilesForGroupChannels} from 'actions/user_actions.jsx';
import {setModalSearchTerm} from 'actions/views/search';

import {GlobalState} from 'types/store';

import MoreDirectChannels from './more_direct_channels';

type OwnProps = {
    isExistingChannel: boolean;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const currentUserId = getCurrentUserId(state);
    let currentChannelMembers: UserProfile[] = [];
    if (ownProps.isExistingChannel) {
        currentChannelMembers = getProfilesInCurrentChannel(state);
    }

    const config = getConfig(state);
    const restrictDirectMessage = config.RestrictDirectMessage;

    const searchTerm = state.views.search.modalSearch;

    let users: UserProfile[];
    if (searchTerm) {
        if (restrictDirectMessage === 'any') {
            users = searchProfilesSelector(state, searchTerm, false);
        } else {
            users = searchProfilesInCurrentTeam(state, searchTerm, false);
        }
    } else if (restrictDirectMessage === 'any') {
        users = selectProfiles(state, {});
    } else {
        users = getProfilesInCurrentTeam(state);
    }

    const filteredGroupChannels = filterGroupChannels(getChannelsWithUserProfiles(state), searchTerm);
    const myDirectChannels = filterDirectChannels(getAllChannels(state), currentUserId);
    const myRecentDirectChannels =
        filterRecentChannels(getAllChannels(state), currentUserId).
            sort((a: Channel, b: Channel) => b.last_post_at - a.last_post_at);
    let recentDirectChannelUsers = myRecentDirectChannels.map((channel: Channel) => {
        const dmUserId = getUserIdFromChannelName(currentUserId, channel.name);
        const user = getUser(state, dmUserId);
        return {...user, last_post_at: channel.last_post_at};
    });

    if (searchTerm) {
        recentDirectChannelUsers = recentDirectChannelUsers.filter((recent) => users.find((user: UserProfile) => user.id === recent.id));
    }
    const team = getCurrentTeam(state);
    const stats = getTotalUsersStatsSelector(state) || {total_users_count: 0};

    return {
        currentTeamId: team.id,
        currentTeamName: team.name,
        searchTerm,
        users: users.sort(sortByUsername),
        myDirectChannels,
        groupChannels: filteredGroupChannels,
        statuses: state.entities.users.statuses,
        currentChannelMembers,
        currentUserId,
        restrictDirectMessage,
        recentDirectChannelUsers,
        totalCount: stats.total_users_count,
        myRecentDirectChannels,
    };
}

const filterGroupChannels = memoizeResult((channels: Array<{profiles: Array<UserProfile>} & Channel>, term: string) => {
    return channels.filter((channel) => {
        const matches = filterProfilesMatchingTerm(channel.profiles, term);
        return matches.length > 0;
    });
});

const filterDirectChannels = memoizeResult((channels: Channel[], userId: string) => {
    return Object.values(channels).filter((channel) => {
        if (channel.type !== 'D') {
            return false;
        }
        if (channel.name && channel.name.indexOf(userId) < 0) {
            return false;
        }
        return true;
    });
});

const filterRecentChannels = (channels: RelationOneToOne<Channel, Channel>, userId: string) => {
    return Object.values(channels).filter((channel) => {
        if (channel.type !== Constants.DM_CHANNEL || channel.last_post_at === 0) {
            return false;
        }
        if (channel.name && channel.name.indexOf(userId) < 0) {
            return false;
        }
        return true;
    });
};

type Actions = {
    getProfiles: (page?: number | undefined, perPage?: number | undefined, options?: any) => Promise<any>;
    getProfilesInTeam: (teamId: string, page: number, perPage?: number | undefined, sort?: string | undefined, options?: any) => Promise<any>;
    getStatusesByIds: (userIds: string[]) => ActionFunc;
    getTotalUsersStats: () => ActionFunc;
    loadStatusesForProfilesList: (users: any) => {
        data: boolean;
    };
    loadProfilesForGroupChannels: (groupChannels: any) => Promise<any>;
    openDirectChannelToUserId: (userId: any) => Promise<any>;
    openGroupChannelToUserIds: (userIds: any) => Promise<any>;
    searchProfiles: (term: string, options?: any) => Promise<any>;
    searchGroupChannels: (term: string) => Promise<any>;
    setModalSearchTerm: (term: any) => GenericAction;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
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
