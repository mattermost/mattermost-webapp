// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {favoriteChannel, leaveChannel, unfavoriteChannel, updateChannelNotifyProps} from 'mattermost-redux/actions/channels';
import {getCustomEmojisInText} from 'mattermost-redux/actions/emojis';
import {General} from 'mattermost-redux/constants';
import {getChannel, getMyChannelMember, isCurrentChannelReadOnly} from 'mattermost-redux/selectors/entities/channels';
import {getMyTeamMember} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, getUser} from 'mattermost-redux/selectors/entities/users';
import {getUserIdFromChannelName, isDefault, isFavoriteChannel} from 'mattermost-redux/utils/channel_utils';
import {getLicense} from 'mattermost-redux/selectors/entities/general';

import {withRouter} from 'react-router-dom';

import {goToLastViewedChannel} from 'actions/views/channel';

import {getPenultimateViewedChannelName} from 'selectors/local_storage';
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
    if (channel && channel.type === General.DM_CHANNEL) {
        const dmUserId = getUserIdFromChannelName(user.id, channel.name);
        dmUser = getUser(state, dmUserId);
    }

    const license = getLicense(state);

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
        rhsState: getRhsState(state),
        isLicensed: license.IsLicensed === 'true',
        isReadOnly: isCurrentChannelReadOnly(state),
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
            goToLastViewedChannel,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChannelHeader));
