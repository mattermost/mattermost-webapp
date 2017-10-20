// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {favoriteChannel, leaveChannel, unfavoriteChannel} from 'mattermost-redux/actions/channels';
import {General, Preferences} from 'mattermost-redux/constants';
import {getChannel, getMyChannelMember} from 'mattermost-redux/selectors/entities/channels';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getMyTeamMember} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';
import {getUserIdFromChannelName, isDefault, isFavoriteChannel} from 'mattermost-redux/utils/channel_utils';

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

    return {
        channel,
        channelMember: getMyChannelMember(state, ownProps.channelId),
        teamMember: getMyTeamMember(state, channel.team_id),
        isFavorite: isFavoriteChannel(prefs, {...channel}),
        isDefault: isDefault(channel),
        currentUser: user,
        dmUser,
        dmUserStatus,
        enableFormatting: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'formatting', true)
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
