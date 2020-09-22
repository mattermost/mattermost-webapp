// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {bindActionCreators} from 'redux';
import {getAllChannelStats} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, getUserStatuses, makeGetProfilesInChannel} from 'mattermost-redux/selectors/entities/users';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';

import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {loadProfilesAndStatusesInChannel} from 'actions/user_actions.jsx';
import {openModal} from 'actions/views/modals';
import {canManageMembers} from 'utils/channel_utils.jsx';
import {sortUsersByStatusAndDisplayName} from 'utils/utils.jsx';

import PopoverListMembers from './popover_list_members.jsx';

const makeSortUsersByStatusAndDisplayName = (doGetProfilesInChannel) => {
    return createSelector(
        (state, channelId) => doGetProfilesInChannel(state, channelId, true),
        getUserStatuses,
        getTeammateNameDisplaySetting,
        (users, statuses, teammateNameDisplay) => sortUsersByStatusAndDisplayName(users, statuses, teammateNameDisplay),
    );
};

function makeMapStateToProps() {
    const doGetProfilesInChannel = makeGetProfilesInChannel();
    const doSortUsersByStatusAndDisplayName = makeSortUsersByStatusAndDisplayName(doGetProfilesInChannel);

    return function mapStateToProps(state, ownProps) {
        const stats = getAllChannelStats(state)[ownProps.channel.id] || {};
        const users = doGetProfilesInChannel(state, ownProps.channel.id, true);
        const statuses = getUserStatuses(state);

        return {
            currentUserId: getCurrentUserId(state),
            memberCount: stats.member_count,
            users,
            statuses,
            teamUrl: getCurrentRelativeTeamUrl(state),
            manageMembers: canManageMembers(state, ownProps.channel),
            sortedUsers: doSortUsersByStatusAndDisplayName(state, ownProps.channel.id),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
            loadProfilesAndStatusesInChannel,
            openDirectChannelToUserId,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PopoverListMembers);
