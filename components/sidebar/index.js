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
    getMyChannelMemberships,
    getUnreads,
    getUnreadChannelIds,
    getSortedDirectChannelIds,
    getSortedFavoriteChannelIds,
    getSortedPublicChannelIds,
    getSortedPrivateChannelIds
} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getBool as getBoolPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam, isCurrentUserCurrentTeamAdmin} from 'mattermost-redux/selectors/entities/teams';

import {goToChannelById} from 'actions/channel_actions.jsx';

import Sidebar from './sidebar.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeammate = currentChannel && currentChannel.teammate_id && getCurrentChannel(state, currentChannel.teammate_id);
    let publicChannelIds;
    let privateChannelIds;
    let favoriteChannelIds;
    let directAndGroupChannelIds;

    const showUnreadSection = config.ExperimentalGroupUnreadChannels === 'true' && getBoolPreference(
        state,
        Preferences.CATEGORY_SIDEBAR_SETTINGS,
        'show_unread_section',
        true
    );

    if (showUnreadSection) {
        publicChannelIds = getSortedPublicChannelIds(state);
        privateChannelIds = getSortedPrivateChannelIds(state);
        favoriteChannelIds = getSortedFavoriteChannelIds(state);
        directAndGroupChannelIds = getSortedDirectChannelIds(state);
    } else {
        publicChannelIds = getSortedPublicChannelWithUnreadsIds(state);
        privateChannelIds = getSortedPrivateChannelWithUnreadsIds(state);
        favoriteChannelIds = getSortedFavoriteChannelWithUnreadsIds(state);
        directAndGroupChannelIds = getSortedDirectChannelWithUnreadsIds(state);
    }

    return {
        config,
        showUnreadSection,
        publicChannelIds,
        privateChannelIds,
        favoriteChannelIds,
        directAndGroupChannelIds,
        unreadChannelIds: getUnreadChannelIds(state),
        currentChannel,
        currentTeammate,
        currentTeam: getCurrentTeam(state),
        currentUser: getCurrentUser(state),
        memberships: getMyChannelMemberships(state),
        unreads: getUnreads(state),
        isSystemAdmin: isCurrentUserSystemAdmin(state),
        isTeamAdmin: isCurrentUserCurrentTeamAdmin(state)
    };
}

function mapDispatchToProps() {
    return {
        actions: {
            goToChannelById
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
