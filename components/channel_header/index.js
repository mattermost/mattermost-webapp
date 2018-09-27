// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {favoriteChannel, leaveChannel, unfavoriteChannel, updateChannelNotifyProps} from 'mattermost-redux/actions/channels';
import {getCustomEmojisInText} from 'mattermost-redux/actions/emojis';
import {General} from 'mattermost-redux/constants';
import {getChannel, getMyChannelMember, isCurrentChannelReadOnly} from 'mattermost-redux/selectors/entities/channels';
import {getMyTeamMember} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {getUserIdFromChannelName, isDefault, isFavoriteChannel} from 'mattermost-redux/utils/channel_utils';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';

import {withRouter} from 'react-router-dom';

import {getLastViewedChannelName, getPenultimateViewedChannelName} from 'selectors/local_storage';
import {Constants} from 'utils/constants.jsx';

import {
    showFlaggedPosts,
    showPinnedPosts,
    showMentions,
    closeRightHandSide,
    updateRhsState,
} from 'actions/views/rhs';
import {openModal} from 'actions/views/modals';
import {getRhsState} from 'selectors/rhs';

import ChannelHeader from './channel_header.jsx';

function mapStateToProps(state, ownProps) {
    const channel = getChannel(state, ownProps.channelId) || {};
    const prefs = state.entities.preferences.myPreferences;
    const user = getCurrentUser(state);

    let dmUser;
    let dmUserStatus;
    if (channel && channel.type === General.DM_CHANNEL) {
        const dmUserId = getUserIdFromChannelName(user.id, channel.name);
        dmUser = getUser(state, dmUserId);
        dmUserStatus = {status: getStatusForUserId(state, dmUserId)};
    }

    const license = getLicense(state);
    const config = getConfig(state);

    let lastViewedChannelName = getLastViewedChannelName(state);
    if (!lastViewedChannelName) {
        lastViewedChannelName = Constants.DEFAULT_CHANNEL;
    }

    let penultimateViewedChannelName = getPenultimateViewedChannelName(state);
    if (!penultimateViewedChannelName) {
        penultimateViewedChannelName = Constants.DEFAULT_CHANNEL;
    }

    return {
        channel,
        channelMember: getMyChannelMember(state, ownProps.channelId),
        teamMember: getMyTeamMember(state, channel.team_id),
        isFavorite: isFavoriteChannel(prefs, ownProps.channelId),
        isDefault: isDefault(channel),
        currentUser: user,
        dmUser,
        dmUserStatus,
        rhsState: getRhsState(state),
        isLicensed: license.IsLicensed === 'true',
        enableWebrtc: config.EnableWebrtc === 'true',
        isReadOnly: isCurrentChannelReadOnly(state),
        lastViewedChannelName,
        penultimateViewedChannelName,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            leaveChannel,
            favoriteChannel,
            unfavoriteChannel,
            showFlaggedPosts,
            showPinnedPosts,
            showMentions,
            closeRightHandSide,
            updateRhsState,
            openModal,
            getCustomEmojisInText,
            updateChannelNotifyProps,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChannelHeader));
