// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    getCurrentChannel,
    getUnreads,
    getSortedUnreadChannelIds,
    getOrderedChannelIds,
} from 'mattermost-redux/selectors/entities/channels';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getSidebarPreferences} from 'mattermost-redux/selectors/entities/sidebar';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {close} from 'actions/views/lhs';
import {getIsLhsOpen} from 'selectors/lhs';

import Sidebar from './sidebar.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeammate = currentChannel && currentChannel.teammate_id && getCurrentChannel(state, currentChannel.teammate_id);

    const sidebarPrefs = getSidebarPreferences(state);

    const lastUnreadChannel = state.views.channel.keepChannelIdAsUnread;

    const unreadChannelIds = getSortedUnreadChannelIds(state, lastUnreadChannel);
    const orderedChannelIds = getOrderedChannelIds(
        state,
        lastUnreadChannel,
        sidebarPrefs.grouping,
        sidebarPrefs.sorting,
        sidebarPrefs.unreads_at_top === 'true',
        sidebarPrefs.favorite_at_top === 'true',
    );

    return {
        config,
        unreadChannelIds,
        orderedChannelIds,
        pluginComponents: state.plugins.components.LeftSidebarHeader,
        currentChannel,
        currentTeammate,
        currentTeam: getCurrentTeam(state),
        currentUser: getCurrentUser(state),
        isOpen: getIsLhsOpen(state),
        unreads: getUnreads(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            close,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
