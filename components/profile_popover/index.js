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
    getChannelMembersInChannels,
    canManageAnyChannelMembersInCurrentTeam,
    getCurrentChannelId,
} from 'mattermost-redux/selectors/entities/channels';

import {openDirectChannelToUserId} from 'actions/channel_actions.jsx';
import {getMembershipForEntities} from 'actions/views/profile_popover';
import {closeModal, openModal} from 'actions/views/modals';

import {areTimezonesEnabledAndSupported} from 'selectors/general';
import {getRhsState, getSelectedPost} from 'selectors/rhs';

import {makeGetCustomStatus, isCustomStatusEnabled} from 'selectors/views/custom_status';

import ProfilePopover from './profile_popover.jsx';

function getDefaultChannelId(state) {
    const selectedPost = getSelectedPost(state);
    return selectedPost.exists ? selectedPost.channel_id : getCurrentChannelId(state);
}

function mapStateToProps(state, {userId, channelId = getDefaultChannelId(state)}) {
    const team = getCurrentTeam(state);
    const teamMember = getTeamMember(state, team.id, userId);
    const getCustomStatus = makeGetCustomStatus();

    let isTeamAdmin = false;
    if (teamMember && teamMember.scheme_admin) {
        isTeamAdmin = true;
    }

    const channelMember = getChannelMembersInChannels(state)?.[channelId]?.[userId];

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
        isInCurrentTeam: Boolean(teamMember) && teamMember.delete_at === 0,
        canManageAnyChannelMembersInCurrentTeam: canManageAnyChannelMembersInCurrentTeam(state),
        status: getStatusForUserId(state, userId),
        teamUrl: getCurrentRelativeTeamUrl(state),
        user: getUser(state, userId),
        modals: state.views.modals.modalState,
        customStatus: getCustomStatus(state, userId),
        isCustomStatusEnabled: isCustomStatusEnabled(state),
        channelId,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeModal,
            openDirectChannelToUserId,
            openModal,
            getMembershipForEntities,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePopover);
