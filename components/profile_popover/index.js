// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCurrentUserId, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {
    getCurrentTeam,
    getCurrentRelativeTeamUrl,
    getTeamMember,
} from 'mattermost-redux/selectors/entities/teams';
import {
    getCurrentChannel,
    getChannelMembersInChannels,
    canManageAnyChannelMembersInCurrentTeam,
} from 'mattermost-redux/selectors/entities/channels';

import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {getMembershipForCurrentEntities} from 'actions/views/profile_popover';
import {openModal} from 'actions/views/modals';

import {areTimezonesEnabledAndSupported} from 'selectors/general';
import {getSelectedPost, getRhsState} from 'selectors/rhs';

import ProfilePopover from './profile_popover.jsx';

function mapStateToProps(state, ownProps) {
    const userId = ownProps.userId;
    const team = getCurrentTeam(state);
    const teamMember = getTeamMember(state, team.id, userId);

    let isTeamAdmin = false;
    if (teamMember && teamMember.scheme_admin) {
        isTeamAdmin = true;
    }

    const selectedPost = getSelectedPost(state);
    const currentChannel = getCurrentChannel(state);

    let channelId;
    if (selectedPost.exists === false) {
        channelId = currentChannel.id;
    } else {
        channelId = selectedPost.channel_id;
    }

    const channelMember = getChannelMembersInChannels(state)[channelId][userId];

    let isChannelAdmin = false;
    if (getRhsState(state) !== 'search' && channelMember != null && channelMember.scheme_admin) {
        isChannelAdmin = true;
    }

    return {
        currentTeamId: team.id,
        currentUserId: getCurrentUserId(state),
        enableTimezone: areTimezonesEnabledAndSupported(state),
        isTeamAdmin,
        isChannelAdmin,
        isInCurrentTeam: Boolean(teamMember),
        canManageAnyChannelMembersInCurrentTeam: canManageAnyChannelMembersInCurrentTeam(state),
        status: getStatusForUserId(state, userId),
        teamUrl: getCurrentRelativeTeamUrl(state),
        user: getUser(state, userId),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            openDirectChannelToUserId,
            openModal,
            getMembershipForCurrentEntities,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePopover);
