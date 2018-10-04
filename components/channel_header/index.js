// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {createSelector} from 'reselect';
import {
    favoriteChannel,
    unfavoriteChannel,
    updateChannelNotifyProps,
} from 'mattermost-redux/actions/channels';
import {getCustomEmojisInText} from 'mattermost-redux/actions/emojis';
import {General} from 'mattermost-redux/constants';
import {
    getCurrentChannel,
    getCurrentChannelId,
    getMyCurrentChannelMembership,
    isCurrentChannelReadOnly,
} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {
    getCurrentTeamUrl,
    getCurrentTeamId,
} from 'mattermost-redux/selectors/entities/teams';
import {
    getCurrentUser,
    getStatusForUserId,
    getUser,
} from 'mattermost-redux/selectors/entities/users';
import {
    getUserIdFromChannelName,
    isFavoriteChannel,
    isChannelMuted,
} from 'mattermost-redux/utils/channel_utils';

import {getLastViewedChannelName} from 'selectors/local_storage';
import {Constants} from 'utils/constants.jsx';
import {
    showFlaggedPosts,
    showPinnedPosts,
    showMentions,
    closeRightHandSide,
    updateRhsState,
} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';

import ChannelHeader from './channel_header.jsx';

const isCurrentChannelFavorite = createSelector(
    getMyPreferences,
    getCurrentChannelId,
    (prefs, channelId) => isFavoriteChannel(prefs, channelId),
);

const isCurrentChannelMuted = createSelector(
    getMyCurrentChannelMembership,
    (membership) => isChannelMuted(membership),
);

const mapStateToProps = (state) => {
    const channel = getCurrentChannel(state) || {};
    const user = getCurrentUser(state);

    let dmUser;
    if (channel && channel.type === General.DM_CHANNEL) {
        const dmUserId = getUserIdFromChannelName(user.id, channel.name);
        dmUser = getUser(state, dmUserId);
    }

    const config = getConfig(state);

    let lastViewedChannelName = getLastViewedChannelName(state);
    if (!lastViewedChannelName || (channel && lastViewedChannelName === channel.name)) {
        lastViewedChannelName = Constants.DEFAULT_CHANNEL;
    }

    return {
        teamId: getCurrentTeamId(state),
        teamUrl: getCurrentTeamUrl(state),
        channel,
        channelMember: getMyCurrentChannelMembership(state),
        currentUser: user,
        dmUser,
        rhsState: getRhsState(state),
        enableWebrtc: config.EnableWebrtc === 'true',
        isFavorite: isCurrentChannelFavorite(state),
        isReadOnly: isCurrentChannelReadOnly(state),
        isMuted: isCurrentChannelMuted(state),
        lastViewedChannelName,
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        favoriteChannel,
        unfavoriteChannel,
        showFlaggedPosts,
        showPinnedPosts,
        showMentions,
        closeRightHandSide,
        updateRhsState,
        getCustomEmojisInText,
        updateChannelNotifyProps,
    }, dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChannelHeader));
