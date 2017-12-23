// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {
    getSortedPublicChannelWithUnreadsIds,
    getSortedPrivateChannelWithUnreadsIds,
    getSortedFavoriteChannelWithUnreadsIds,
    getSortedDirectChannelWithUnreadsIds,
    getCurrentChannel,
    getMyChannelMemberships,
    getUnreads,
    getUnreadChannelIds
} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam, isCurrentUserCurrentTeamAdmin} from 'mattermost-redux/selectors/entities/teams';

import {goToChannelById} from 'actions/channel_actions.jsx';

import Sidebar from './sidebar.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeammate = currentChannel && currentChannel.teammate_id && getCurrentChannel(state, currentChannel.teammate_id);

    return {
        config,
        publicChannelIds: getSortedPublicChannelWithUnreadsIds(state),
        privateChannelIds: getSortedPrivateChannelWithUnreadsIds(state),
        favoriteChannelIds: getSortedFavoriteChannelWithUnreadsIds(state),
        directAndGroupChannelIds: getSortedDirectChannelWithUnreadsIds(state),
        unreadChannelIds: getUnreadChannelIds(state),
        currentChannel,
        currentTeammate,
        currentTeam: getCurrentTeam(state),
        currentUser: getCurrentUser(state),
        memberships: getMyChannelMemberships(state),
        unreads: getUnreads(state),
        isSystemAdmin: isCurrentUserSystemAdmin(state),
        isTeamAdmin: isCurrentUserCurrentTeamAdmin(state)
    };
}

function mapDispatchToProps() {
    return {
        actions: {
            goToChannelById
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
