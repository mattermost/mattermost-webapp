// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {createSelector} from 'reselect';

import {getCurrentChannelStats, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentRelativeTeamUrl, getMembersInCurrentTeam, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, getUserStatuses, getProfilesInCurrentChannel} from 'mattermost-redux/selectors/entities/users';
import {getTeammateNameDisplaySetting, getAddMembersToChannel} from 'mattermost-redux/selectors/entities/preferences';

import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {loadProfilesAndStatusesInChannel, loadProfilesAndTeamMembersAndChannelMembers} from 'actions/user_actions.jsx';
import {openModal} from 'actions/views/modals';

import {canManageMembers} from 'utils/channel_utils.jsx';
import {sortUsersByStatusAndDisplayName} from 'utils/utils.jsx';

import PopoverListMembers from './popover_list_members.jsx';

const getUsersToDisplay = createSelector(
    'getUsersToDisplay',
    getProfilesInCurrentChannel,
    getMembersInCurrentTeam,
    getUserStatuses,
    getTeammateNameDisplaySetting,
    (users = [], teamMembers = {}, statuses, teammateNameDisplay) => {
        const usersToDisplay = [];

        for (let i = 0; i < users.length; i++) {
            const user = users[i];

            if (teamMembers[user.id] && user.delete_at === 0) {
                usersToDisplay.push(user);
            }
        }

        return {
            usersToDisplay: sortUsersByStatusAndDisplayName(usersToDisplay, statuses, teammateNameDisplay),
        };
    },
);

function mapStateToProps(state) {
    const stats = getCurrentChannelStats(state) || {member_count: 0};
    const statuses = getUserStatuses(state);
    const currentChannel = getCurrentChannel(state);

    return {
        ...getUsersToDisplay(state),
        currentChannel,
        currentTeamId: getCurrentTeamId(state),
        currentUserId: getCurrentUserId(state),
        memberCount: stats.member_count,
        statuses,
        teamUrl: getCurrentRelativeTeamUrl(state),
        manageMembers: canManageMembers(state, currentChannel),
        addMembersABTest: getAddMembersToChannel(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadProfilesAndStatusesInChannel,
            loadProfilesAndTeamMembersAndChannelMembers,
            openDirectChannelToUserId,
            openModal,
        }, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(PopoverListMembers);
