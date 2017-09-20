// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getChannel, getMyChannelMember} from 'mattermost-redux/selectors/entities/channels';
import {getMyTeamMember} from 'mattermost-redux/selectors/entities/teams';
import {getUser, getStatusForUserId, getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {leaveChannel, favoriteChannel, unfavoriteChannel} from 'mattermost-redux/actions/channels';

import {isFavoriteChannel, isDefault, getUserIdFromChannelName} from 'mattermost-redux/utils/channel_utils';
import {General, Preferences} from 'mattermost-redux/constants';

import ChannelHeader from './channel_header.jsx';

function mapStateToProps(state, ownProps) {
    const channel = getChannel(state, ownProps.channelId);
    const prefs = state.entities.preferences.myPreferences;
    const user = getCurrentUser(state);

    let dmUser;
    let dmUserStatus;
    if (channel && channel.type === General.DM_CHANNEL) {
        const dmUserId = getUserIdFromChannelName(user.id, channel.name);
        dmUser = getUser(state, dmUserId);
        dmUserStatus = {status: getStatusForUserId(state, dmUserId)};
    }

    return {
        channel,
        channelMember: getMyChannelMember(state, ownProps.channelId),
        teamMember: getMyTeamMember(state, channel.team_id),
        isFavorite: isFavoriteChannel(prefs, {...channel}),
        isDefault: isDefault(channel),
        currentUser: user,
        dmUser,
        dmUserStatus,
        enableFormatting: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'formatting', false)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            leaveChannel,
            favoriteChannel,
            unfavoriteChannel
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelHeader);
