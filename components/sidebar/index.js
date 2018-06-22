// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {Preferences} from 'mattermost-redux/constants/index';
import {
    getCurrentChannel,
    getUnreads,
    getSortedUnreadChannelIds,
    getOrderedChannelIds,
} from 'mattermost-redux/selectors/entities/channels';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getBool as getBoolPreference, get as getPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {GroupUnreadChannels} from 'utils/constants.jsx';
import {close} from 'actions/views/lhs';
import {getIsLhsOpen} from 'selectors/lhs';

import Sidebar from './sidebar.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeammate = currentChannel && currentChannel.teammate_id && getCurrentChannel(state, currentChannel.teammate_id);

    const showUnreadSection = config.ExperimentalGroupUnreadChannels !== GroupUnreadChannels.DISABLED && getBoolPreference(
        state,
        Preferences.CATEGORY_SIDEBAR_SETTINGS,
        'show_unread_section',
        config.ExperimentalGroupUnreadChannels === GroupUnreadChannels.DEFAULT_ON
    );

    let sidebarPrefs = getPreference(
        state,
        Preferences.CATEGORY_SIDEBAR_SETTINGS,
        '',
        JSON.stringify({
            grouping: 'by_type', // none, by_type
            unreads_at_top: 'true',
            favorite_at_top: 'true',
            sorting: 'alpha',
        })
    );
    sidebarPrefs = JSON.parse(sidebarPrefs);

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

    // Support sidebarPreference for old implementation
    if (!showUnreadSection && sidebarPrefs.unreads_at_top === 'true') {
        sidebarPrefs.unreads_at_top = 'false';
    }

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
