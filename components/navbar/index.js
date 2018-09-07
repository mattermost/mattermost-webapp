// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, getUserStatuses} from 'mattermost-redux/selectors/entities/users';
import {
    getCurrentChannel,
    getCurrentChannelStats,
    getMyCurrentChannelMembership,
    isCurrentChannelReadOnly,
} from 'mattermost-redux/selectors/entities/channels';
import {isFavoriteChannel, isDefault as isDefaultChannel} from 'mattermost-redux/utils/channel_utils';
import {leaveChannel} from 'mattermost-redux/actions/channels';

import {leaveChannel} from 'actions/views/channel';
import {
    closeRightHandSide as closeRhs,
    updateRhsState,
    showPinnedPosts,
    toggleMenu as toggleRhsMenu,
    closeMenu as closeRhsMenu,
} from 'actions/views/rhs';
import {toggle as toggleLhs, close as closeLhs} from 'actions/views/lhs';
import {getRhsState} from 'selectors/rhs';
import {RHSStates} from 'utils/constants';

import Navbar from './navbar.jsx';

const mapStateToProps = createSelector(
    getCurrentTeamUrl,
    getCurrentUser,
    getUserStatuses,
    getCurrentChannel,
    getCurrentChannelStats,
    getMyCurrentChannelMembership,
    isCurrentChannelReadOnly,
    getConfig,
    getRhsState,
    (
        currentTeamUrl,
        currentUser,
        userStatuses,
        channel,
        channelStats,
        channelMembership,
        isReadOnly,
        config,
        rhsState,
    ) => ({
        currentTeamUrl,
        currentUser,
        userStatuses,
        channel,
        channelMembership,
        memberCount: channelStats && channelStats.member_count,
        isDefault: channel && isDefaultChannel(channel),
        isFavorite: channel && isFavoriteChannel(channel),
        isReadOnly,
        hasPinnedPosts: rhsState === RHSStates.PIN,
        enableWebrtc: config.EnableWebrtc === 'true',
    }),
);

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        leaveChannel,
        updateRhsState,
        showPinnedPosts,
        toggleLhs,
        closeLhs,
        closeRhs,
        toggleRhsMenu,
        closeRhsMenu,
    }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
