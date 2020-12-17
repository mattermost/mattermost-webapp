// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-nested-callbacks */

import {createSelector} from 'reselect';

import {
    getAllChannels,
    getCurrentChannelId,
    getMyChannelMemberships,
    getUnreadChannelIds,
} from 'mattermost-redux/selectors/entities/channels';
import {makeGetChannelsByCategory, makeGetCategoriesForTeam} from 'mattermost-redux/selectors/entities/channel_categories';
import {getLastPostPerChannel} from 'mattermost-redux/selectors/entities/posts';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {Channel} from 'mattermost-redux/types/channels';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';
import {createIdsSelector, memoizeResult} from 'mattermost-redux/utils/helpers';

import {getItemFromStorage} from 'selectors/storage';
import {GlobalState} from 'types/store';
import {StoragePrefixes} from 'utils/constants';
import {getPrefix} from 'utils/storage_utils';

function isCategoryCollapsedFromStorage(prefix: string, storage: {[key: string]: any}, categoryId: string) {
    return getItemFromStorage(storage, prefix + StoragePrefixes.CHANNEL_CATEGORY_COLLAPSED + categoryId, false);
}

export function isCategoryCollapsed(state: GlobalState, categoryId: string) {
    return isCategoryCollapsedFromStorage(getPrefix(state), state.storage.storage, categoryId);
}

export function isUnreadFilterEnabled(state: GlobalState) {
    return state.views.channelSidebar.unreadFilterEnabled;
}

export const getCategoriesForCurrentTeam: (state: GlobalState) => ChannelCategory[] = (() => {
    const getCategoriesForTeam = makeGetCategoriesForTeam();

    return memoizeResult((state: GlobalState) => {
        const currentTeamId = getCurrentTeamId(state);
        return getCategoriesForTeam(state, currentTeamId);
    });
})();

export const getChannelsByCategoryForCurrentTeam: (state: GlobalState) => RelationOneToOne<ChannelCategory, Channel[]> = (() => {
    const getChannelsByCategory = makeGetChannelsByCategory();

    return memoizeResult((state: GlobalState) => {
        const currentTeamId = getCurrentTeamId(state);
        return getChannelsByCategory(state, currentTeamId);
    });
})();

// getChannelsInCategoryOrder returns an array of channels on the current team that are currently visible in the sidebar.
// Channels are returned in the same order as in the sidebar.
export const getChannelsInCategoryOrder = (() => {
    const getCollapsedStateForAllCategories = createIdsSelector(
        getPrefix,
        getCategoriesForCurrentTeam,
        (state: GlobalState) => state.storage.storage,
        (prefix, categories, storage) => {
            return categories.reduce((map: Record<string, boolean>, category: ChannelCategory) => {
                map[category.id] = isCategoryCollapsedFromStorage(prefix, storage, category.id);
                return map;
            }, {});
        },
    );

    return createSelector(
        getCollapsedStateForAllCategories,
        getCategoriesForCurrentTeam,
        getChannelsByCategoryForCurrentTeam,
        getCurrentChannelId,
        (state: GlobalState) => getUnreadChannelIds(state),
        (collapsedState, categories, channelsByCategory, currentChannelId, unreadChannelIds) => {
            return categories.map((category) => {
                const channels = channelsByCategory[category.id];
                const isCollapsed = collapsedState[category.id];

                if (isCollapsed) {
                    const filter = (channel: Channel) => {
                        const filterByUnread = (channelId: string) => channel.id === channelId;
                        const isUnread = unreadChannelIds.some(filterByUnread);

                        return isUnread || currentChannelId === channel.id;
                    };
                    return channels.filter(filter);
                }

                return channels;
            }).flat();
        },
    );
})();

// getUnreadChannels returns an array of all unread channels on the current team for display with the unread filter
// enabled. Channels are sorted by recency with channels containing a mention grouped first.
export const getUnreadChannels = (() => {
    const getUnsortedUnreadChannels = createSelector(
        getAllChannels,
        (state: GlobalState) => getUnreadChannelIds(state),
        getCurrentChannelId,
        (allChannels, unreadChannelIds, currentChannelId) => {
            const unreadChannels = [];
            for (const channelId of unreadChannelIds) {
                const channel = allChannels[channelId];

                // Only include an archived channel if it's the current channel
                if (channel.delete_at > 0 && channel.id !== currentChannelId) {
                    continue;
                }

                unreadChannels.push(channel);
            }

            if (unreadChannels.findIndex((channel) => channel.id === currentChannelId) === -1) {
                unreadChannels.push(allChannels[currentChannelId]);
            }

            return unreadChannels;
        },
    );

    const sortChannels = createSelector(
        (state: GlobalState, channels: Channel[]) => channels,
        getMyChannelMemberships,
        getLastPostPerChannel,
        (state: GlobalState) => state.views.channel.lastUnreadChannel,
        (channels, myMembers, lastPosts, lastUnreadChannel) => {
            function isMuted(channel: Channel) {
                return isChannelMuted(myMembers[channel.id]);
            }

            function hasMentions(channel: Channel) {
                if (lastUnreadChannel && channel.id === lastUnreadChannel.id && lastUnreadChannel.hadMentions) {
                    return true;
                }

                const member = myMembers[channel.id];
                return member?.mention_count !== 0;
            }

            // Sort channels with mentions first and then sort by recency
            return [...channels].sort((a, b) => {
                // Sort muted channels last
                if (isMuted(a) && !isMuted(b)) {
                    return 1;
                } else if (!isMuted(a) && isMuted(b)) {
                    return -1;
                }

                // Sort non-muted mentions first
                if (hasMentions(a) && !hasMentions(b)) {
                    return -1;
                } else if (!hasMentions(a) && hasMentions(b)) {
                    return 1;
                }

                // If available, get the last post time from the loaded posts for the channel, but fall back to the
                // channel's last_post_at if that's not available. The last post time from the loaded posts is more
                // accurate because channel.last_post_at is not updated on the client as new messages come in.
                const aLastPostAt = maxDefined(a.last_post_at, lastPosts[a.id]?.create_at);
                const bLastPostAt = maxDefined(b.last_post_at, lastPosts[b.id]?.create_at);

                return bLastPostAt - aLastPostAt;
            });
        },
    );

    return (state: GlobalState) => {
        const channels = getUnsortedUnreadChannels(state);
        return sortChannels(state, channels);
    };
})();

function maxDefined(a: number, b?: number) {
    return typeof b === 'undefined' ? a : Math.max(a, b);
}

export function getDisplayedChannels(state: GlobalState) {
    return isUnreadFilterEnabled(state) ? getUnreadChannels(state) : getChannelsInCategoryOrder(state);
}

export function getDraggingState(state: GlobalState) {
    return state.views.channelSidebar.draggingState;
}
