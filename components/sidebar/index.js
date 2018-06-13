// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {createSelector} from 'reselect';

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
    getMyChannels,
} from 'mattermost-redux/selectors/entities/channels';

import {getLastPostPerChannel} from 'mattermost-redux/selectors/entities/posts';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getBool as getBoolPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {GroupUnreadChannels} from 'utils/constants.jsx';
import {close} from 'actions/views/lhs';
import {getIsLhsOpen} from 'selectors/lhs';

import Sidebar from './sidebar.jsx';

const getSortedRecentlyChannelIds = createSelector(
    getMyChannels,
    getLastPostPerChannel,
    (channels, lastPosts) => {
        const recentChannelIds = channels.sort((a, b) => {
            const aLastPostAt = (lastPosts[a.id] && lastPosts[a.id].update_at) || a.last_post_at;
            const bLastPostAt = (lastPosts[b.id] && lastPosts[b.id].update_at) || b.last_post_at;

            const aDate = new Date(aLastPostAt);
            const bDate = new Date(bLastPostAt);

            return bDate.getTime() - aDate.getTime();
        });

        return recentChannelIds.map((c) => c.id);
    }
);

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeammate = currentChannel && currentChannel.teammate_id && getCurrentChannel(state, currentChannel.teammate_id);
    let recentChannelIds = [];
    let publicChannelIds = [];
    let privateChannelIds = [];
    let favoriteChannelIds = [];
    let directAndGroupChannelIds = [];

    const showUnreadSection = config.ExperimentalGroupUnreadChannels !== GroupUnreadChannels.DISABLED && getBoolPreference(
        state,
        Preferences.CATEGORY_SIDEBAR_SETTINGS,
        'show_unread_section',
        config.ExperimentalGroupUnreadChannels === GroupUnreadChannels.DEFAULT_ON
    );

    const showRecentSection = getBoolPreference(
        state,
        Preferences.CATEGORY_SIDEBAR_SETTINGS,
        'show_recent_section',
        false
    );

    const keepChannelIdAsUnread = state.views.channel.keepChannelIdAsUnread;

    if (showRecentSection) {
        recentChannelIds = getSortedRecentlyChannelIds(state);
    } else if (showUnreadSection) {
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

    return {
        config,
        isOpen: getIsLhsOpen(state),
        showRecentSection,
        showUnreadSection,
        recentChannelIds,
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
