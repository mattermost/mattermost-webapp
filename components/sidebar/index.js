// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';

import {Preferences} from 'mattermost-redux/constants/index';
import {
    getCurrentChannel,
    getSortedUnreadChannelIds,
    getOrderedChannelIds,
} from 'mattermost-redux/selectors/entities/channels';

import Permissions from 'mattermost-redux/constants/permissions';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getBool as getBoolPreference, getSidebarPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeam, getMyTeams, getTeamMemberships} from 'mattermost-redux/selectors/entities/teams';

import {switchToChannelById} from 'actions/views/channel';
import {openModal} from 'actions/views/modals';
import {close} from 'actions/views/lhs';
import {getIsLhsOpen} from 'selectors/lhs';

import Sidebar from './sidebar.jsx';

const getTotalUnreads = createSelector(
    getMyTeams,
    getTeamMemberships,
    (myTeams, myTeamMemberships) => {
        return myTeams.reduce((acc, team) => {
            const member = myTeamMemberships[team.id];
            acc.messageCount += member.msg_count;
            acc.mentionCount += member.mention_count;

            return acc;
        }, {messageCount: 0, mentionCount: 0});
    }
);

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeammate = currentChannel && currentChannel.teammate_id && getCurrentChannel(state, currentChannel.teammate_id);
    const currentTeam = getCurrentTeam(state);

    const canCreatePublicChannel = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.CREATE_PUBLIC_CHANNEL});
    const canCreatePrivateChannel = haveITeamPermission(state, {team: currentTeam.id, permission: Permissions.CREATE_PRIVATE_CHANNEL});

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

    const channelSwitcherOption = getBoolPreference(
        state,
        Preferences.CATEGORY_SIDEBAR_SETTINGS,
        'channel_switcher_section',
        'true'
    );

    return {
        config,
        unreadChannelIds,
        orderedChannelIds,
        channelSwitcherOption,
        currentChannel,
        currentTeammate,
        currentTeam,
        currentUser: getCurrentUser(state),
        canCreatePublicChannel,
        canCreatePrivateChannel,
        isOpen: getIsLhsOpen(state),
        unreads: getTotalUnreads(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            close,
            switchToChannelById,
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
