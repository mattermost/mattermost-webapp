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
import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
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

import {goToLastViewedChannel} from 'actions/views/channel';
import {getPenultimateViewedChannelName} from 'selectors/local_storage';
import {Constants} from 'utils/constants';
import {
    showFlaggedPosts,
    showPinnedPosts,
    showMentions,
    closeRightHandSide,
    updateRhsState,
} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';

import ChannelHeader from './channel_header';

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

    let penultimateViewedChannelName = getPenultimateViewedChannelName(state);
    if (!penultimateViewedChannelName) {
        penultimateViewedChannelName = Constants.DEFAULT_CHANNEL;
    }

    return {
        teamId: getCurrentTeamId(state),
        channel,
        channelMember: getMyCurrentChannelMembership(state),
        currentUser: user,
        dmUser,
        rhsState: getRhsState(state),
        isFavorite: isCurrentChannelFavorite(state),
        isReadOnly: isCurrentChannelReadOnly(state),
        isMuted: isCurrentChannelMuted(state),
        penultimateViewedChannelName,
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
        goToLastViewedChannel,
    }, dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChannelHeader));
