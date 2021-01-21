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
import {makeGetChannelsByCategory, makeGetCategoriesForTeam, makeGetChannelsForCategory} from 'mattermost-redux/selectors/entities/channel_categories';
import {getLastPostPerChannel} from 'mattermost-redux/selectors/entities/posts';
import {shouldShowUnreadsCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {Channel} from 'mattermost-redux/types/channels';
import {CategorySorting, ChannelCategory} from 'mattermost-redux/types/channel_categories';
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

export const getAutoSortedCategoryIds: (state: GlobalState) => Set<string> = (() => createSelector(
    (state: GlobalState) => getCategoriesForCurrentTeam(state),
    (categories) => {
        return new Set(categories.filter((category) =>
            category.sorting === CategorySorting.Alphabetical ||
            category.sorting === CategorySorting.Recency).map((category) => category.id));
    },
))();

export const getChannelsByCategoryForCurrentTeam: (state: GlobalState) => RelationOneToOne<ChannelCategory, Channel[]> = (() => {
    const getChannelsByCategory = makeGetChannelsByCategory();

    return memoizeResult((state: GlobalState) => {
        const currentTeamId = getCurrentTeamId(state);
        return getChannelsByCategory(state, currentTeamId);
    });
})();

const getUnreadChannelIdsSet = createSelector(
    (state: GlobalState) => getUnreadChannelIds(state, state.views.channel.lastUnreadChannel),
    (unreadChannelIds) => {
        return new Set(unreadChannelIds);
    },
);

// getChannelsInCategoryOrder returns an array of channels on the current team that are currently visible in the sidebar.
// Channels are returned in the same order as in the sidebar. Channels in the Unreads category are not included.
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
        getUnreadChannelIdsSet,
        shouldShowUnreadsCategory,
        (collapsedState, categories, channelsByCategory, currentChannelId, unreadChannelIds, showUnreadsCategory) => {
            return categories.map((category) => {
                const channels = channelsByCategory[category.id];
                const isCollapsed = collapsedState[category.id];

                return channels.filter((channel: Channel) => {
                    const isUnread = unreadChannelIds.has(channel.id);

                    if (showUnreadsCategory) {
                        // Filter out channels that have been moved to the Unreads category
                        if (isUnread) {
                            return false;
                        }
                    }

                    if (isCollapsed) {
                        // Filter out channels that would be hidden by a collapsed category
                        if (!isUnread && currentChannelId !== channel.id) {
                            return false;
                        }
                    }

                    return true;
                });
            }).flat();
        },
    );
})();

// getUnreadChannels returns an array of all unread channels on the current team for display with the unread filter
// enabled. Channels are sorted by recency with channels containing a mention grouped first.
export const getUnreadChannels = (() => {
    const getUnsortedUnreadChannels = createSelector(
        getAllChannels,
        getUnreadChannelIdsSet,
        getCurrentChannelId,
        isUnreadFilterEnabled,
        (allChannels, unreadChannelIds, currentChannelId, unreadFilterEnabled) => {
            const unreadChannels = [];
            for (const channelId of unreadChannelIds) {
                const channel = allChannels[channelId];

                // Only include an archived channel if it's the current channel
                if (channel.delete_at > 0 && channel.id !== currentChannelId) {
                    continue;
                }

                unreadChannels.push(channel);
            }

            // This selector is used for both the unread filter and the unreads category which treat the current
            // channel differently
            if (unreadFilterEnabled) {
                // The current channel is already in unreadChannels if it was previously unread but we need to add it
                // if it wasn't previously unread
                if (currentChannelId && unreadChannels.findIndex((channel) => channel.id === currentChannelId) === -1) {
                    unreadChannels.push(allChannels[currentChannelId]);
                }
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

// Returns an array of channels in the order that they currently appear in the sidebar. Channels are filtered out if they
// are hidden such as by a collapsed category or the unread filter.
export const getDisplayedChannels = (() => {
    const memoizedConcat = memoizeResult((unreadChannels: Channel[], channelsInCategoryOrder: Channel[]) => {
        return [...unreadChannels, ...channelsInCategoryOrder];
    }) as (a: Channel[], b: Channel[]) => Channel[];

    return (state: GlobalState) => {
        // If the unread filter is enabled, only unread channels are shown
        if (isUnreadFilterEnabled(state)) {
            return getUnreadChannels(state);
        }

        // Otherwise, if the Unreads category is enabled, unread channels are shown first followed by non-unread channels in category order
        if (shouldShowUnreadsCategory(state)) {
            return memoizedConcat(getUnreadChannels(state), getChannelsInCategoryOrder(state));
        }

        // Otherwise, channels are shown in category order
        return getChannelsInCategoryOrder(state);
    };
})();

// Returns a selector that, given a category, returns the channels visible in that category. The returned channels do not
// include unread channels when the Unreads category is enabled.
export function makeGetFilteredChannelsForCategory() {
    const getChannelsForCategory = makeGetChannelsForCategory();

    return createSelector(
        getChannelsForCategory,
        getUnreadChannelIdsSet,
        shouldShowUnreadsCategory,
        (channels, unreadChannelIdsSet, showUnreadsCategory) => {
            if (!showUnreadsCategory) {
                return channels;
            }

            const filtered = channels.filter((channel) => !unreadChannelIdsSet.has(channel.id));

            return filtered.length === channels.length ? channels : filtered;
        },
    );
}

export function getDraggingState(state: GlobalState) {
    return state.views.channelSidebar.draggingState;
}

export function isChannelSelected(state: GlobalState, channelId: string) {
    return state.views.channelSidebar.multiSelectedChannelIds.indexOf(channelId) !== -1;
}
