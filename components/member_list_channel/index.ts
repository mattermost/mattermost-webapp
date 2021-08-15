// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import {
    loadProfilesAndTeamMembersAndChannelMembers,
    loadTeamMembersAndChannelMembersForProfilesList,
} from 'actions/user_actions.jsx';
import {setModalFilters, setModalSearchTerm} from 'actions/views/search';
import {getChannelMembers, getChannelStats} from 'mattermost-redux/actions/channels';
import {searchProfiles} from 'mattermost-redux/actions/users';
import {getCurrentChannel, getCurrentChannelStats, getMembersInCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getMembersInCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {filterProfiles, getProfilesInCurrentChannel, searchProfilesInCurrentChannel} from 'mattermost-redux/selectors/entities/users';
import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';
import {profileListToMap, sortByUsername} from 'mattermost-redux/utils/user_utils';

import {createSelector} from 'reselect';
import {GlobalState} from 'types/store';

import MemberListChannel, {Props} from './member_list_channel';

const getUsersAndActionsToDisplay = createSelector(
    'getUsersAndActionsToDisplay',
    (state: GlobalState, users: UserProfile[]) => ({users, filters: state.views.search.modalFilters}),
    getMembersInCurrentTeam,
    getMembersInCurrentChannel,
    getCurrentChannel,
    ({users = [], filters = {}}, teamMembers = {}, channelMembers = {}, channel) => {
        const actionUserProps: {
            [userId: string]: {
                channel: Channel;
                teamMember: any;
                channelMember: ChannelMembership;
            };
        } = {};
        const usersToDisplay: UserProfile[] = [];

        for (let i = 0; i < users.length; i++) {
            const user = users[i];

            if (teamMembers[user.id] && channelMembers[user.id] && user.delete_at === 0) {
                usersToDisplay.push(user);

                actionUserProps[user.id] = {
                    channel,
                    teamMember: teamMembers[user.id],
                    channelMember: channelMembers[user.id],
                };
            }
        }

        console.log({channelMembers});
        const totalAdminsInChannel = Object.values(channelMembers).reduce((acc, k) => {
            return k.roles.includes('admin') ? acc + 1 : acc;
        }, 0);

        const filteredUsersToDisplayMap = filterProfiles(profileListToMap(usersToDisplay), filters);
        const filteredUsersToDisplay = Object.values(filteredUsersToDisplayMap).sort(sortByUsername);

        return {
            usersToDisplay: filteredUsersToDisplay,
            actionUserProps,
            totalAdminsInChannel,
        };
    },
);

function mapStateToProps(state: GlobalState) {
    const searchTerm = state.views.search.modalSearch;

    let users;
    if (searchTerm) {
        users = searchProfilesInCurrentChannel(state, searchTerm);
    } else {
        users = getProfilesInCurrentChannel(state);
    }

    const stats = getCurrentChannelStats(state) || {member_count: 0};

    return {
        ...getUsersAndActionsToDisplay(state, users),
        currentTeamId: state.entities.teams.currentTeamId,
        currentChannelId: state.entities.channels.currentChannelId,
        searchTerm,
        totalChannelMembers: stats.member_count,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Props['actions']>({
            getChannelMembers,
            getChannelStats,
            loadProfilesAndTeamMembersAndChannelMembers,
            loadStatusesForProfilesList,
            loadTeamMembersAndChannelMembersForProfilesList,
            searchProfiles,
            setModalFilters,
            setModalSearchTerm,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemberListChannel);
