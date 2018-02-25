// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {Preferences} from 'mattermost-redux/constants/index';
import {
    getSortedPublicChannelWithUnreadsIds,
    getSortedPrivateChannelWithUnreadsIds,
    getSortedFavoriteChannelWithUnreadsIds,
    getSortedDirectChannelWithUnreadsIds,
    getCurrentChannel,
    getUnreads,
    getSortedUnreadChannelIds,
    getSortedDirectChannelIds,
    getSortedFavoriteChannelIds,
    getSortedPublicChannelIds,
    getSortedPrivateChannelIds,
} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getBool as getBoolPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam, isCurrentUserCurrentTeamAdmin} from 'mattermost-redux/selectors/entities/teams';

import {goToChannelById} from 'actions/channel_actions.jsx';
import {showCreateOption} from 'utils/channel_utils.jsx';
import {GroupUnreadChannels, Constants} from 'utils/constants.jsx';

import Sidebar from './sidebar.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeammate = currentChannel && currentChannel.teammate_id && getCurrentChannel(state, currentChannel.teammate_id);
    let publicChannelIds;
    let privateChannelIds;
    let favoriteChannelIds;
    let directAndGroupChannelIds;

    const showUnreadSection = config.ExperimentalGroupUnreadChannels !== GroupUnreadChannels.DISABLED && getBoolPreference(
        state,
        Preferences.CATEGORY_SIDEBAR_SETTINGS,
        'show_unread_section',
        config.ExperimentalGroupUnreadChannels === GroupUnreadChannels.DEFAULT_ON
    );

    const keepChannelIdAsUnread = state.views.channel.keepChannelIdAsUnread;

    if (showUnreadSection) {
        publicChannelIds = getSortedPublicChannelIds(state, keepChannelIdAsUnread);
        privateChannelIds = getSortedPrivateChannelIds(state, keepChannelIdAsUnread);
        favoriteChannelIds = getSortedFavoriteChannelIds(state, keepChannelIdAsUnread);
        directAndGroupChannelIds = getSortedDirectChannelIds(state, keepChannelIdAsUnread);
    } else {
        publicChannelIds = getSortedPublicChannelWithUnreadsIds(state);
        privateChannelIds = getSortedPrivateChannelWithUnreadsIds(state);
        favoriteChannelIds = getSortedFavoriteChannelWithUnreadsIds(state);
        directAndGroupChannelIds = getSortedDirectChannelWithUnreadsIds(state);
    }

    const isSystemAdmin = isCurrentUserSystemAdmin(state);
    const isTeamAdmin = isCurrentUserCurrentTeamAdmin(state);
    const showCreatePublicChannelOption = showCreateOption(state, Constants.OPEN_CHANNEL, isTeamAdmin, isSystemAdmin);
    const showCreatePrivateChannelOption = showCreateOption(state, Constants.PRIVATE_CHANNEL, isTeamAdmin, isSystemAdmin);

    return {
        config,
        showUnreadSection,
        publicChannelIds,
        privateChannelIds,
        favoriteChannelIds,
        directAndGroupChannelIds,
        unreadChannelIds: getSortedUnreadChannelIds(state, keepChannelIdAsUnread),
        currentChannel,
        currentTeammate,
        currentTeam: getCurrentTeam(state),
        currentUser: getCurrentUser(state),
        unreads: getUnreads(state),
        showCreatePublicChannelOption,
        showCreatePrivateChannelOption,
    };
}

function mapDispatchToProps() {
    return {
        actions: {
            goToChannelById,
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
