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

    // Prototyping
    getCurrentChannelId,
    getAllChannels,
    getUnreadChannelIds,
    getMyChannelMemberships,
    getChannelIdsForCurrentTeam,
} from 'mattermost-redux/selectors/entities/channels';

import {
    buildDisplayableChannelList,
    buildDisplayableChannelListWithUnreadSection,
    canManageMembersOldPermissions,
    completeDirectChannelInfo,
    completeDirectChannelDisplayName,
    getUserIdFromChannelName,
    isChannelMuted,
    getDirectChannelName,
    isAutoClosed,
    isDirectChannelVisible,
    isGroupChannelVisible,
    isGroupOrDirectChannelVisible,
    sortChannelsByDisplayName,
    sortChannelsByDisplayNameAndMuted,
} from 'mattermost-redux/utils/channel_utils';

import {createIdsSelector} from 'mattermost-redux/utils/helpers';
import {General} from 'mattermost-redux/constants';

import {getLastPostPerChannel} from 'mattermost-redux/selectors/entities/posts';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getBool as getBoolPreference, get as getPreference, getFavoritesPreferences, getVisibleTeammate, getVisibleGroupIds, getTeammateNameDisplaySetting, getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser, getUsers} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {GroupUnreadChannels} from 'utils/constants.jsx';
import {close} from 'actions/views/lhs';
import {getIsLhsOpen} from 'selectors/lhs';

import Sidebar from './sidebar.jsx';

const mapAndSortChannelIds = (channels, currentUser, myMembers, lastPosts, sorting) => {
    const locale = currentUser.locale || General.DEFAULT_LOCALE;

    if (sorting === 'recent') {
        channels.sort((a, b) => {
            const aLastPostAt = (lastPosts[a.id] && lastPosts[a.id].update_at) || a.last_post_at;
            const bLastPostAt = (lastPosts[b.id] && lastPosts[b.id].update_at) || b.last_post_at;

            const aDate = new Date(aLastPostAt);
            const bDate = new Date(bLastPostAt);

            return bDate.getTime() - aDate.getTime();
        });
    } else {
        channels.sort(sortChannelsByDisplayNameAndMuted.bind(null, locale, myMembers));
    }

    return channels.map((c) => c.id);
};

function filterChannels(unreadIds, favoriteIds, channelIds, unreadsAtTop, favoritesAtTop) {
    let channels = channelIds;

    if (unreadsAtTop) {
        channels = channels.filter((id) => {
            return !unreadIds.includes(id);
        });
    }

    if (favoritesAtTop) {
        channels = channels.filter((id) => {
            return !favoriteIds.includes(id);
        });
    }

    return channels;
}

// Public Channels
const getPublicChannels = createIdsSelector(
    getCurrentUser,
    getAllChannels,
    getMyChannelMemberships,
    getChannelIdsForCurrentTeam,
    (currentUser, channels, myMembers, teamChannelIds) => {
        if (!currentUser) {
            return [];
        }

        const publicChannels = teamChannelIds.filter((id) => {
            if (!myMembers[id]) {
                return false;
            }
            const channel = channels[id];
            return teamChannelIds.includes(id) && channel.type === General.OPEN_CHANNEL;
        }).map((id) => channels[id]);

        return publicChannels;
    },
);

const getPublicChannelIds = createIdsSelector(
    getPublicChannels,
    getCurrentUser,
    getMyChannelMemberships,
    getLastPostPerChannel,
    (state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting = 'alpha') => sorting,
    mapAndSortChannelIds,
);

const getNewSortedPublicChannelIds = createIdsSelector(
    getUnreadChannelIds,
    getFavoritesPreferences,
    getPublicChannelIds,
    (state, lastUnreadChannel, unreadsAtTop = true) => unreadsAtTop,
    (state, lastUnreadChannel, unreadsAtTop, favoritesAtTop = true) => favoritesAtTop,
    filterChannels,
);

// Private Channels
export const getPrivateChannels = createIdsSelector(
    getCurrentUser,
    getAllChannels,
    getMyChannelMemberships,
    getChannelIdsForCurrentTeam,
    (currentUser, channels, myMembers, teamChannelIds) => {
        if (!currentUser) {
            return [];
        }

        const privateChannels = teamChannelIds.filter((id) => {
            if (!myMembers[id]) {
                return false;
            }
            const channel = channels[id];
            return teamChannelIds.includes(id) &&
                channel.type === General.PRIVATE_CHANNEL;
        }).map((id) => channels[id]);

        return privateChannels;
    }
);

const getPrivateChannelIds = createIdsSelector(
    getPrivateChannels,
    getCurrentUser,
    getMyChannelMemberships,
    getLastPostPerChannel,
    (state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting = 'alpha') => sorting,
    mapAndSortChannelIds,
);

const getNewSortedPrivateChannelIds = createIdsSelector(
    getUnreadChannelIds,
    getFavoritesPreferences,
    getPrivateChannelIds,
    (state, lastUnreadChannel, unreadsAtTop = true) => unreadsAtTop,
    (state, lastUnreadChannel, unreadsAtTop, favoritesAtTop = true) => favoritesAtTop,
    filterChannels,
);

// Direct Messages
export const getDirectChannels = createIdsSelector(
    getCurrentUser,
    getUsers,
    getAllChannels,
    getMyChannelMemberships,
    getVisibleTeammate,
    getVisibleGroupIds,
    getSortedFavoriteChannelWithUnreadsIds,
    getTeammateNameDisplaySetting,
    getConfig,
    getMyPreferences,
    getLastPostPerChannel,
    getCurrentChannelId,
    (currentUser, profiles, channels, myMembers, teammates, groupIds, settings, config, preferences, lastPosts, currentChannelId) => {
        if (!currentUser) {
            return [];
        }

        const channelValues = Object.values(channels);
        const directChannelsIds = [];
        teammates.reduce((result, teammateId) => {
            const name = getDirectChannelName(currentUser.id, teammateId);
            const channel = channelValues.find((c) => c.name === name); //eslint-disable-line max-nested-callbacks
            if (channel) {
                const lastPost = lastPosts[channel.id];
                const otherUser = profiles[getUserIdFromChannelName(currentUser.id, channel.name)];
                if (!isAutoClosed(config, preferences, channel, lastPost ? lastPost.create_at : 0, otherUser ? otherUser.delete_at : 0, currentChannelId)) {
                    result.push(channel.id);
                }
            }
            return result;
        }, directChannelsIds);
        const directChannels = groupIds.filter((id) => {
            const channel = channels[id];
            if (channel) {
                const lastPost = lastPosts[channel.id];
                return !isAutoClosed(config, preferences, channels[id], lastPost ? lastPost.create_at : 0, currentChannelId);
            }

            return false;
        }).concat(directChannelsIds).map((id) => {
            const channel = channels[id];
            return completeDirectChannelDisplayName(currentUser.id, profiles, settings, channel);
        });

        return directChannels;
    }
);

const getDirectChannelIds = createIdsSelector(
    getDirectChannels,
    getCurrentUser,
    getMyChannelMemberships,
    getLastPostPerChannel,
    (state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting = 'alpha') => sorting,
    mapAndSortChannelIds,
);

const getNewSortedDirectChannelIds = createIdsSelector(
    getUnreadChannelIds,
    getFavoritesPreferences,
    getDirectChannelIds,
    (state, lastUnreadChannel, unreadsAtTop = true) => unreadsAtTop,
    (state, lastUnreadChannel, unreadsAtTop, favoritesAtTop = true) => favoritesAtTop,
    filterChannels,
);

const getFavoriteChannels = createIdsSelector(
    getCurrentUser,
    getUsers,
    getAllChannels,
    getMyChannelMemberships,
    getFavoritesPreferences,
    getChannelIdsForCurrentTeam,
    getTeammateNameDisplaySetting,
    getConfig,
    getMyPreferences,
    getCurrentChannelId,
    (currentUser, profiles, channels, myMembers, favoriteIds, teamChannelIds, settings, config, prefs, currentChannelId) => {
        if (!currentUser) {
            return [];
        }

        const favoriteChannel = favoriteIds.filter((id) => {
            if (!myMembers[id] || !channels[id]) {
                return false;
            }

            const channel = channels[id];
            const otherUserId = getUserIdFromChannelName(currentUser.id, channel.name);
            if (channel.type === General.DM_CHANNEL && !isDirectChannelVisible(profiles[otherUserId] || otherUserId, config, prefs, channel, null, null, currentChannelId)) {
                return false;
            } else if (channel.type === General.GM_CHANNEL && !isGroupChannelVisible(config, prefs, channel)) {
                return false;
            }

            return teamChannelIds.includes(id);
        }).map((id) => {
            const c = channels[id];
            if (c.type === General.DM_CHANNEL || c.type === General.GM_CHANNEL) {
                return completeDirectChannelDisplayName(currentUser.id, profiles, settings, c);
            }

            return c;
        });

        return favoriteChannel;
    }
);

const getFavoriteChannelIds = createIdsSelector(
    getFavoriteChannels,
    getCurrentUser,
    getMyChannelMemberships,
    getLastPostPerChannel,
    (state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting = 'alpha') => sorting,
    mapAndSortChannelIds,
);

// Favorites
const getNewSortedFavoriteChannelIds = createIdsSelector(
    getUnreadChannelIds,
    getFavoritesPreferences,
    getFavoriteChannelIds,
    (state, lastUnreadChannel, unreadsAtTop = true) => unreadsAtTop,
    () => false,
    filterChannels,
);

// Unreads
const getNewUnreadChannels = createIdsSelector(
    getCurrentUser,
    getUsers,
    getAllChannels,
    getMyChannelMemberships,
    getUnreadChannelIds,
    getTeammateNameDisplaySetting,
    (currentUser, profiles, channels, myMembers, unreadIds, settings) => {
        // If we receive an unread for a channel and then a mention the channel
        // won't be sorted correctly until we receive a message in another channel
        if (!currentUser) {
            return [];
        }

        const allUnreadChannels = unreadIds.filter((u) => u).map((id) => {
            const c = channels[id];

            if (c.type === General.DM_CHANNEL || c.type === General.GM_CHANNEL) {
                return completeDirectChannelDisplayName(currentUser.id, profiles, settings, c);
            }

            return c;
        });

        return allUnreadChannels;
    }
);

const getNewUnreadChannelIds = createIdsSelector(
    getNewUnreadChannels,
    getCurrentUser,
    getMyChannelMemberships,
    getLastPostPerChannel,
    (state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting = 'alpha') => sorting,
    mapAndSortChannelIds,
);

const getNewSortedUnreadsChannelIds = createIdsSelector(
    getUnreadChannelIds,
    getFavoritesPreferences,
    getNewUnreadChannelIds,
    () => false,
    () => false,
    filterChannels,
);

// public, private, direct
const getAllChannels_TEST = createIdsSelector(
    getPublicChannels,
    getPrivateChannels,
    getDirectChannels,
    (
        publicChannels,
        privateChannels,
        directChannels,
    ) => {
        const allChannels = [
            ...publicChannels,
            ...privateChannels,
            ...directChannels,
        ];

        return allChannels;
    }
);

const getAllChannelIds = createIdsSelector(
    getAllChannels_TEST,
    getCurrentUser,
    getMyChannelMemberships,
    getLastPostPerChannel,
    (state, lastUnreadChannel, sorting = 'alpha') => sorting,
    mapAndSortChannelIds,
);

const getOrderedChannelIds = (state, lastUnreadChannel, grouping, sorting, unreadsAtTop, favoritesAtTop) => {
    if (grouping === 'by_type') {
        const channels = [];

        channels.push({
            type: 'public',
            name: 'PUBLIC CHANNELS',
            items: getNewSortedPublicChannelIds(
                state,
                lastUnreadChannel,
                unreadsAtTop,
                favoritesAtTop,
                sorting,
            ),
        });

        channels.push({
            type: 'private',
            name: 'PRIVATE CHANNELS',
            items: getNewSortedPrivateChannelIds(
                state,
                lastUnreadChannel,
                unreadsAtTop,
                favoritesAtTop,
                sorting,
            ),
        });

        channels.push({
            type: 'direct',
            name: 'DIRECT MESSAGES',
            items: getNewSortedDirectChannelIds(
                state,
                lastUnreadChannel,
                unreadsAtTop,
                favoritesAtTop,
                sorting,
            ),
        });

        if (favoritesAtTop) {
            channels.unshift({
                type: 'favorite',
                name: 'FAVORITE MESSAGES',
                items: getNewSortedFavoriteChannelIds(
                    state,
                    lastUnreadChannel,
                    unreadsAtTop,
                    favoritesAtTop,
                    sorting,
                ),
            });
        }

        if (unreadsAtTop) {
            channels.unshift({
                type: 'unreads',
                name: 'UNREADS',
                items: getNewSortedUnreadsChannelIds(
                    state,
                    lastUnreadChannel,
                    unreadsAtTop,
                    favoritesAtTop,
                    sorting,
                ),
            });
        }

        return channels;
    }

    // Combine all channel types
    let type = 'alpha';
    let name = 'CHANNELS';
    if (sorting === 'recent') {
        type = 'recent';
        name = 'RECENT CHANNELS';
    }

    return [{
        type,
        name,
        items: getAllChannelIds(state, lastUnreadChannel, sorting),
    }];
};

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeammate = currentChannel && currentChannel.teammate_id && getCurrentChannel(state, currentChannel.teammate_id);

    // const showUnreadSection = config.ExperimentalGroupUnreadChannels !== GroupUnreadChannels.DISABLED && getBoolPreference(
    //     state,
    //     Preferences.CATEGORY_SIDEBAR_SETTINGS,
    //     'show_unread_section',
    //     config.ExperimentalGroupUnreadChannels === GroupUnreadChannels.DEFAULT_ON
    // );

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

    console.log('orderedChannelIds', orderedChannelIds);

    // TODO: backport new sidebar settings preference to old implementation

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
