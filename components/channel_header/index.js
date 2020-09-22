// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {
    favoriteChannel,
    unfavoriteChannel,
    updateChannelNotifyProps,
} from 'mattermost-redux/actions/channels';
import {getCustomEmojisInText} from 'mattermost-redux/actions/emojis';
import {General} from 'mattermost-redux/constants';
import {
    getCurrentChannel,
    getMyCurrentChannelMembership,
    isCurrentChannelFavorite,
    isCurrentChannelMuted,
    isCurrentChannelReadOnly,
    getCurrentChannelStats,
} from 'mattermost-redux/selectors/entities/channels';
import {getTeammateNameDisplaySetting, getNewSidebarPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentRelativeTeamUrl, getCurrentTeamId, getMyTeams} from 'mattermost-redux/selectors/entities/teams';
import {
    getCurrentUser,
    getUser,
    makeGetProfilesInChannel,
} from 'mattermost-redux/selectors/entities/users';
import {getUserIdFromChannelName} from 'mattermost-redux/utils/channel_utils';

import {goToLastViewedChannel} from 'actions/views/channel';
import {openModal, closeModal} from 'actions/views/modals';
import {
    showFlaggedPosts,
    showPinnedPosts,
    showMentions,
    openRHSSearch,
    closeRightHandSide,
} from 'actions/views/rhs';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {isModalOpen} from 'selectors/views/modals';
import {getAnnouncementBarCount} from 'selectors/views/announcement_bar';
import {ModalIdentifiers} from 'utils/constants';

import ChannelHeader from './channel_header';

function makeMapStateToProps() {
    const doGetProfilesInChannel = makeGetProfilesInChannel();

    return function mapStateToProps(state) {
        const channel = getCurrentChannel(state) || {};
        const user = getCurrentUser(state);
        const teams = getMyTeams(state);
        const hasMoreThanOneTeam = teams.length > 1;

        let dmUser;
        let gmMembers;
        if (channel && channel.type === General.DM_CHANNEL) {
            const dmUserId = getUserIdFromChannelName(user.id, channel.name);
            dmUser = getUser(state, dmUserId);
        } else if (channel && channel.type === General.GM_CHANNEL) {
            gmMembers = doGetProfilesInChannel(state, channel.id, false);
        }
        const stats = getCurrentChannelStats(state) || {member_count: 0, guest_count: 0, pinnedpost_count: 0};

        return {
            teamId: getCurrentTeamId(state),
            channel,
            channelMember: getMyCurrentChannelMembership(state),
            currentUser: user,
            dmUser,
            gmMembers,
            rhsState: getRhsState(state),
            rhsOpen: getIsRhsOpen(state),
            isFavorite: isCurrentChannelFavorite(state),
            isReadOnly: isCurrentChannelReadOnly(state),
            isMuted: isCurrentChannelMuted(state),
            isQuickSwitcherOpen: isModalOpen(state, ModalIdentifiers.QUICK_SWITCH),
            hasGuests: stats.guest_count > 0,
            pinnedPostsCount: stats.pinnedpost_count,
            hasMoreThanOneTeam,
            teammateNameDisplaySetting: getTeammateNameDisplaySetting(state),
            currentRelativeTeamUrl: getCurrentRelativeTeamUrl(state),
            newSideBarPreference: getNewSidebarPreference(state),
            announcementBarCount: getAnnouncementBarCount(state),
        };
    };
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        favoriteChannel,
        unfavoriteChannel,
        showFlaggedPosts,
        showPinnedPosts,
        showMentions,
        openRHSSearch,
        closeRightHandSide,
        getCustomEmojisInText,
        updateChannelNotifyProps,
        goToLastViewedChannel,
        openModal,
        closeModal,
    }, dispatch),
});

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(ChannelHeader));
