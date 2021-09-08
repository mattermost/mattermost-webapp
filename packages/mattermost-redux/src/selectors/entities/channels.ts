// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import {createSelector} from 'reselect';

import {General, Permissions, Preferences} from 'mattermost-redux/constants';
import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';

import {getCategoryInTeamByType} from 'mattermost-redux/selectors/entities/channel_categories';
import {
    getCurrentChannelId,
    getCurrentUser,
    getUsers,
    getMyChannelMemberships,
    getMyCurrentChannelMembership,
} from 'mattermost-redux/selectors/entities/common';
import {getConfig, getLicense, hasNewPermissions} from 'mattermost-redux/selectors/entities/general';
import {
    getTeammateNameDisplaySetting,
    isCollapsedThreadsEnabled,
} from 'mattermost-redux/selectors/entities/preferences';
import {haveICurrentChannelPermission, haveIChannelPermission, haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {
    getCurrentTeamId,
    getCurrentTeamMembership,
    getMyTeams,
    getTeamMemberships,
} from 'mattermost-redux/selectors/entities/teams';
import {
    getCurrentUserId,
    getStatusForUserId,
    getUser,
    getUserIdsInChannels,
    isCurrentUserSystemAdmin,
} from 'mattermost-redux/selectors/entities/users';

import {
    Channel,
    ChannelMemberCountsByGroup,
    ChannelMembership,
    ChannelMessageCount,
    ChannelModeration,
    ChannelSearchOpts,
    ChannelStats,
} from 'mattermost-redux/types/channels';
import {ClientConfig} from 'mattermost-redux/types/config';
import {GlobalState} from 'mattermost-redux/types/store';
import {TeamMembership, Team} from 'mattermost-redux/types/teams';
import {UsersState, UserProfile} from 'mattermost-redux/types/users';
import {
    IDMappedObjects,
    NameMappedObjects,
    RelationOneToMany,
    RelationOneToOne,
    UserIDMappedObjects,
} from 'mattermost-redux/types/utilities';

import {
    canManageMembersOldPermissions,
    completeDirectChannelInfo,
    completeDirectGroupInfo,
    newCompleteDirectChannelInfo,
    completeDirectChannelDisplayName,
    getUserIdFromChannelName,
    getChannelByName as getChannelByNameHelper,
    isChannelMuted,
    sortChannelsByDisplayName,
    isDefault,
    isDirectChannel,
    filterChannelsMatchingTerm,
    calculateUnreadCount,
} from 'mattermost-redux/utils/channel_utils';
import {createIdsSelector} from 'mattermost-redux/utils/helpers';
import {Constants} from 'utils/constants';
import {getDataRetentionCustomPolicy} from 'mattermost-redux/selectors/entities/admin';

import {getThreadCounts} from './threads';

export {getCurrentChannelId, getMyChannelMemberships, getMyCurrentChannelMembership};

export function getAllChannels(state: GlobalState): IDMappedObjects<Channel> {
    return state.entities.channels.channels;
}

export function getAllChannelStats(state: GlobalState): RelationOneToOne<Channel, ChannelStats> {
    return state.entities.channels.stats;
}

export function getChannelsInTeam(state: GlobalState): RelationOneToMany<Team, Channel> {
    return state.entities.channels.channelsInTeam;
}

export function getChannelsInPolicy() {
    return (createSelector(
        'getChannelsInPolicy',
        getAllChannels,
        (state: GlobalState, props: {policyId: string}) => getDataRetentionCustomPolicy(state, props.policyId),
        (getAllChannels, policy) => {
            if (!policy) {
                return [];
            }

            const policyChannels: Channel[] = [];

            Object.entries(getAllChannels).forEach((channelEntry: [string, Channel]) => {
                const [, channel] = channelEntry;
                if (channel.policy_id === policy.id) {
                    policyChannels.push(channel);
                }
            });

            return policyChannels;
        }) as (b: GlobalState, a: {
        policyId: string;
    }) => Channel[]);
}

export const getDirectChannelsSet: (state: GlobalState) => Set<string> = createSelector(
    'getDirectChannelsSet',
    getChannelsInTeam,
    (channelsInTeam: RelationOneToMany<Team, Channel>): Set<string> => {
        if (!channelsInTeam) {
            return new Set();
        }

        return new Set(channelsInTeam['']);
    },
);

export function getChannelMembersInChannels(state: GlobalState): RelationOneToOne<Channel, UserIDMappedObjects<ChannelMembership>> {
    return state.entities.channels.membersInChannel;
}

// makeGetChannel returns a selector that returns a channel from the store with the following filled in for DM/GM channels:
// - The display_name set to the other user(s) names, following the Teammate Name Display setting
// - The teammate_id for DM channels
// - The status of the other user in a DM channel
export function makeGetChannel(): (state: GlobalState, props: {id: string}) => Channel {
    return createSelector(
        'makeGetChannel',
        getCurrentUserId,
        (state: GlobalState) => state.entities.users.profiles,
        (state: GlobalState) => state.entities.users.profilesInChannel,
        (state: GlobalState, props: {id: string}) => {
            const channel = getChannel(state, props.id);
            if (!channel || !isDirectChannel(channel)) {
                return '';
            }

            const currentUserId = getCurrentUserId(state);
            const teammateId = getUserIdFromChannelName(currentUserId, channel.name);
            const teammateStatus = getStatusForUserId(state, teammateId);

            return teammateStatus || 'offline';
        },
        (state: GlobalState, props: {id: string}) => getChannel(state, props.id),
        getTeammateNameDisplaySetting,
        (currentUserId, profiles, profilesInChannel, teammateStatus, channel, teammateNameDisplay) => {
            if (channel) {
                return newCompleteDirectChannelInfo(currentUserId, profiles, profilesInChannel, teammateStatus, teammateNameDisplay!, channel);
            }

            return channel;
        },
    );
}

// getChannel returns a channel as it exists in the store without filling in any additional details such as the
// display_name for DM/GM channels.
export function getChannel(state: GlobalState, id: string) {
    return getAllChannels(state)[id];
}

export function getMyChannelMembership(state: GlobalState, channelId: string): ChannelMembership {
    return getMyChannelMemberships(state)[channelId];
}

// makeGetChannelsForIds returns a selector that, given an array of channel IDs, returns a list of the corresponding
// channels. Channels are returned in the same order as the given IDs with undefined entries replacing any invalid IDs.
// Note that memoization will fail if an array literal is passed in.
export function makeGetChannelsForIds(): (state: GlobalState, ids: string[]) => Channel[] {
    return createSelector(
        'makeGetChannelsForIds',
        getAllChannels,
        (state: GlobalState, ids: string[]) => ids,
        (allChannels, ids) => {
            return ids.map((id) => allChannels[id]);
        },
    );
}

export const getCurrentChannel: (state: GlobalState) => Channel = createSelector(
    'getCurrentChannel',
    getAllChannels,
    getCurrentChannelId,
    (state: GlobalState): UsersState => state.entities.users,
    getTeammateNameDisplaySetting,
    (allChannels: IDMappedObjects<Channel>, currentChannelId: string, users: UsersState, teammateNameDisplay: string): Channel => {
        const channel = allChannels[currentChannelId];

        if (channel) {
            return completeDirectChannelInfo(users, teammateNameDisplay, channel);
        }

        return channel;
    },
);

export const getCurrentChannelNameForSearchShortcut: (state: GlobalState) => string | undefined = createSelector(
    'getCurrentChannelNameForSearchShortcut',
    getAllChannels,
    getCurrentChannelId,
    (state: GlobalState): UsersState => state.entities.users,
    (allChannels: IDMappedObjects<Channel>, currentChannelId: string, users: UsersState): string | undefined => {
        const channel = allChannels[currentChannelId];

        // Only get the extra info from users if we need it
        if (channel?.type === Constants.DM_CHANNEL) {
            const dmChannelWithInfo = completeDirectChannelInfo(users, Preferences.DISPLAY_PREFER_USERNAME, channel);
            return `@${dmChannelWithInfo.display_name}`;
        }

        // Replace spaces in GM channel names
        if (channel?.type === Constants.GM_CHANNEL) {
            const gmChannelWithInfo = completeDirectGroupInfo(users, Preferences.DISPLAY_PREFER_USERNAME, channel, false);
            return `@${gmChannelWithInfo.display_name.replace(/\s/g, '')}`;
        }

        return channel?.name;
    },
);

export const getMyChannelMember: (state: GlobalState, channelId: string) => ChannelMembership | undefined | null = createSelector(
    'getMyChannelMember',
    getMyChannelMemberships,
    (state: GlobalState, channelId: string): string => channelId,
    (channelMemberships: RelationOneToOne<Channel, ChannelMembership>, channelId: string): ChannelMembership | undefined | null => {
        return channelMemberships[channelId] || null;
    },
);

export const getCurrentChannelStats: (state: GlobalState) => ChannelStats = createSelector(
    'getCurrentChannelStats',
    getAllChannelStats,
    getCurrentChannelId,
    (allChannelStats: RelationOneToOne<Channel, ChannelStats>, currentChannelId: string): ChannelStats => {
        return allChannelStats[currentChannelId];
    },
);

export function isCurrentChannelFavorite(state: GlobalState): boolean {
    const currentChannelId = getCurrentChannelId(state);

    return isFavoriteChannel(state, currentChannelId);
}

export const isCurrentChannelMuted: (state: GlobalState) => boolean = createSelector(
    'isCurrentChannelMuted',
    getMyCurrentChannelMembership,
    (membership?: ChannelMembership): boolean => {
        if (!membership) {
            return false;
        }

        return isChannelMuted(membership);
    },
);

export const isCurrentChannelArchived: (state: GlobalState) => boolean = createSelector(
    'isCurrentChannelArchived',
    getCurrentChannel,
    (channel: Channel): boolean => channel.delete_at !== 0,
);

export const isCurrentChannelDefault: (state: GlobalState) => boolean = createSelector(
    'isCurrentChannelDefault',
    getCurrentChannel,
    (channel: Channel): boolean => isDefault(channel),
);

export function isCurrentChannelReadOnly(state: GlobalState): boolean {
    return isChannelReadOnly(state, getCurrentChannel(state));
}

export function isChannelReadOnlyById(state: GlobalState, channelId: string): boolean {
    return isChannelReadOnly(state, getChannel(state, channelId));
}

export function isChannelReadOnly(state: GlobalState, channel: Channel): boolean {
    return channel && channel.name === General.DEFAULT_CHANNEL && !isCurrentUserSystemAdmin(state) && getConfig(state).ExperimentalTownSquareIsReadOnly === 'true';
}

export function getChannelMessageCounts(state: GlobalState): RelationOneToOne<Channel, ChannelMessageCount> {
    return state.entities.channels.messageCounts;
}

export function getChannelMessageCount(state: GlobalState, channelId: string): ChannelMessageCount {
    return getChannelMessageCounts(state)[channelId];
}

function getCurrentChannelMessageCount(state: GlobalState) {
    return getChannelMessageCount(state, getCurrentChannelId(state));
}

export const countCurrentChannelUnreadMessages: (state: GlobalState) => number = createSelector(
    'countCurrentChannelUnreadMessages',
    getCurrentChannelMessageCount,
    getMyCurrentChannelMembership,
    isCollapsedThreadsEnabled,
    (messageCount: ChannelMessageCount, membership?: ChannelMembership, crtEnabled?: boolean): number => {
        if (!membership) {
            return 0;
        }
        return crtEnabled ? messageCount.root - membership.msg_count_root : messageCount.total - membership.msg_count;
    },
);

export function makeGetChannelUnreadCount(): (state: GlobalState, channelId: string) => ReturnType<typeof calculateUnreadCount> {
    return createSelector(
        'makeGetChannelUnreadCount',
        (state: GlobalState, channelId: string) => getChannelMessageCount(state, channelId),
        (state: GlobalState, channelId: string) => getMyChannelMembership(state, channelId),
        isCollapsedThreadsEnabled,
        (messageCount: ChannelMessageCount, member: ChannelMembership, crtEnabled: boolean) => {
            return calculateUnreadCount(messageCount, member, crtEnabled);
        },
    );
}

export function getChannelByName(state: GlobalState, channelName: string): Channel | undefined | null {
    return getChannelByNameHelper(getAllChannels(state), channelName);
}

export const getChannelSetInCurrentTeam: (state: GlobalState) => string[] = createSelector(
    'getChannelSetInCurrentTeam',
    getCurrentTeamId,
    getChannelsInTeam,
    (currentTeamId: string, channelsInTeam: RelationOneToMany<Team, Channel>): string[] => {
        return (channelsInTeam && channelsInTeam[currentTeamId]) || [];
    },
);

function sortAndInjectChannels(channels: IDMappedObjects<Channel>, channelSet: string[], locale: string): Channel[] {
    const currentChannels: Channel[] = [];

    if (typeof channelSet === 'undefined') {
        return currentChannels;
    }

    channelSet.forEach((c) => {
        currentChannels.push(channels[c]);
    });

    return currentChannels.sort(sortChannelsByDisplayName.bind(null, locale));
}

export const getChannelsInCurrentTeam: (state: GlobalState) => Channel[] = createSelector(
    'getChannelsInCurrentTeam',
    getAllChannels,
    getChannelSetInCurrentTeam,
    getCurrentUser,
    (channels: IDMappedObjects<Channel>, currentTeamChannelSet: string[], currentUser: UserProfile): Channel[] => {
        let locale = General.DEFAULT_LOCALE;

        if (currentUser && currentUser.locale) {
            locale = currentUser.locale;
        }

        return sortAndInjectChannels(channels, currentTeamChannelSet, locale);
    },
);

export const getChannelsNameMapInTeam: (state: GlobalState, teamId: string) => NameMappedObjects<Channel> = createSelector(
    'getChannelsNameMapInTeam',
    getAllChannels,
    getChannelsInTeam,
    (state: GlobalState, teamId: string): string => teamId,
    (channels: IDMappedObjects<Channel>, channelsInTeams: RelationOneToMany<Team, Channel>, teamId: string): NameMappedObjects<Channel> => {
        const channelsInTeam = channelsInTeams[teamId] || [];
        const channelMap: NameMappedObjects<Channel> = {};
        channelsInTeam.forEach((id) => {
            const channel = channels[id];
            channelMap[channel.name] = channel;
        });
        return channelMap;
    },
);

export const getChannelsNameMapInCurrentTeam: (state: GlobalState) => NameMappedObjects<Channel> = createSelector(
    'getChannelsNameMapInCurrentTeam',
    getAllChannels,
    getChannelSetInCurrentTeam,
    (channels: IDMappedObjects<Channel>, currentTeamChannelSet: string[]): NameMappedObjects<Channel> => {
        const channelMap: NameMappedObjects<Channel> = {};
        currentTeamChannelSet.forEach((id) => {
            const channel = channels[id];
            channelMap[channel.name] = channel;
        });
        return channelMap;
    },
);

export const getChannelNameToDisplayNameMap: (state: GlobalState) => Record<string, string> = createIdsSelector(
    'getChannelNameToDisplayNameMap',
    getAllChannels,
    getChannelSetInCurrentTeam,
    (channels: IDMappedObjects<Channel>, currentTeamChannelSet: string[]) => {
        const channelMap: Record<string, string> = {};
        for (const id of currentTeamChannelSet) {
            const channel = channels[id];
            channelMap[channel.name] = channel.display_name;
        }
        return channelMap;
    },
);

// Returns both DMs and GMs
export const getAllDirectChannels: (state: GlobalState) => Channel[] = createSelector(
    'getAllDirectChannels',
    getAllChannels,
    getDirectChannelsSet,
    (state: GlobalState): UsersState => state.entities.users,
    getTeammateNameDisplaySetting,
    (channels: IDMappedObjects<Channel>, channelSet: Set<string>, users: UsersState, teammateNameDisplay: string): Channel[] => {
        const dmChannels: Channel[] = [];
        channelSet.forEach((c) => {
            dmChannels.push(completeDirectChannelInfo(users, teammateNameDisplay, channels[c]));
        });
        return dmChannels;
    },
);

export const getAllDirectChannelsNameMapInCurrentTeam: (state: GlobalState) => NameMappedObjects<Channel> = createSelector(
    'getAllDirectChannelsNameMapInCurrentTeam',
    getAllChannels,
    getDirectChannelsSet,
    (state: GlobalState): UsersState => state.entities.users,
    getTeammateNameDisplaySetting,
    (channels: IDMappedObjects<Channel>, channelSet: Set<string>, users: UsersState, teammateNameDisplay: string): NameMappedObjects<Channel> => {
        const channelMap: NameMappedObjects<Channel> = {};
        channelSet.forEach((id) => {
            const channel = channels[id];
            channelMap[channel.name] = completeDirectChannelInfo(users, teammateNameDisplay, channel);
        });
        return channelMap;
    },
);

// Returns only GMs
export const getGroupChannels: (state: GlobalState) => Channel[] = createSelector(
    'getGroupChannels',
    getAllChannels,
    getDirectChannelsSet,
    (state: GlobalState): UsersState => state.entities.users,
    getTeammateNameDisplaySetting,
    (channels: IDMappedObjects<Channel>, channelSet: Set<string>, users: UsersState, teammateNameDisplay: string): Channel[] => {
        const gmChannels: Channel[] = [];
        channelSet.forEach((id) => {
            const channel = channels[id];

            if (channel.type === General.GM_CHANNEL) {
                gmChannels.push(completeDirectChannelInfo(users, teammateNameDisplay, channel));
            }
        });
        return gmChannels;
    },
);

export const getMyChannels: (state: GlobalState) => Channel[] = createSelector(
    'getMyChannels',
    getChannelsInCurrentTeam,
    getAllDirectChannels,
    getMyChannelMemberships,
    (channels: Channel[], directChannels: Channel[], myMembers: RelationOneToOne<Channel, ChannelMembership>): Channel[] => {
        return [...channels, ...directChannels].filter((c) => myMembers.hasOwnProperty(c.id));
    },
);

export const getOtherChannels: (state: GlobalState, archived?: boolean | null) => Channel[] = createSelector(
    'getOtherChannels',
    getChannelsInCurrentTeam,
    getMyChannelMemberships,
    (state: GlobalState, archived: boolean | undefined | null = true) => archived,
    (channels: Channel[], myMembers: RelationOneToOne<Channel, ChannelMembership>, archived?: boolean | null): Channel[] => {
        return channels.filter((c) => !myMembers.hasOwnProperty(c.id) && c.type === General.OPEN_CHANNEL && (archived ? true : c.delete_at === 0));
    },
);

export const getMembersInCurrentChannel: (state: GlobalState) => UserIDMappedObjects<ChannelMembership> = createSelector(
    'getMembersInCurrentChannel',
    getCurrentChannelId,
    getChannelMembersInChannels,
    (currentChannelId: string, members: RelationOneToOne<Channel, UserIDMappedObjects<ChannelMembership>>): UserIDMappedObjects<ChannelMembership> => {
        return members[currentChannelId];
    },
);

/**
 * A scalar encoding or primitive-value representation of
 */
export type BasicUnreadStatus = boolean | number;
export type BasicUnreadMeta = {isUnread: boolean; unreadMentionCount: number}
export function basicUnreadMeta(unreadStatus: BasicUnreadStatus): BasicUnreadMeta {
    return {
        isUnread: Boolean(unreadStatus),
        unreadMentionCount: (typeof unreadStatus === 'number' && unreadStatus) || 0,
    };
}

export const getUnreadStatus: (state: GlobalState) => BasicUnreadStatus = createSelector(
    'getUnreadStatus',
    getAllChannels,
    getMyChannelMemberships,
    getChannelMessageCounts,
    getUsers,
    getCurrentUserId,
    getCurrentTeamId,
    getMyTeams,
    getTeamMemberships,
    isCollapsedThreadsEnabled,
    getThreadCounts,
    (
        channels,
        myMembers,
        messageCounts,
        users,
        currentUserId,
        currentTeamId,
        myTeams,
        myTeamMemberships,
        collapsedThreads,
        threadCounts,
    ) => {
        const {
            messages: currentTeamUnreadMessages,
            mentions: currentTeamUnreadMentions,
        } = Object.entries(myMembers).reduce((counts, [channelId, membership]) => {
            const channel = channels[channelId];

            if (!channel || !membership) {
                return counts;
            }

            if (
                // other-team non-DM/non-GM channels
                channel.team_id !== currentTeamId &&
                channel.type !== General.DM_CHANNEL &&
                channel.type !== General.GM_CHANNEL
            ) {
                return counts;
            }

            const channelExists = channel.type === General.DM_CHANNEL ? users[getUserIdFromChannelName(currentUserId, channel.name)]?.delete_at === 0 : channel.delete_at === 0;
            if (!channelExists) {
                return counts;
            }

            const mentions = collapsedThreads ? membership.mention_count_root : membership.mention_count;
            if (mentions) {
                counts.mentions += mentions;
            }

            const unreadCount = calculateUnreadCount(messageCounts[channelId], myMembers[channelId], collapsedThreads);
            if (unreadCount.showUnread) {
                counts.messages += unreadCount.messages;
            }

            return counts;
        }, {
            messages: 0,
            mentions: 0,
        });

        // Includes mention count and message count from teams other than the current team
        // This count does not include GM's and DM's
        const {
            messages: otherTeamsUnreadMessages,
            mentions: otherTeamsUnreadMentions,
        } = myTeams.reduce((acc, team) => {
            if (currentTeamId !== team.id) {
                const member = myTeamMemberships[team.id];
                acc.messages += collapsedThreads ? member.msg_count_root : member.msg_count;
                acc.mentions += collapsedThreads ? member.mention_count_root : member.mention_count;
            }

            return acc;
        }, {
            messages: 0,
            mentions: 0,
        });

        const totalUnreadMessages = currentTeamUnreadMessages + otherTeamsUnreadMessages;
        let totalUnreadMentions = currentTeamUnreadMentions + otherTeamsUnreadMentions;
        let anyUnreadThreads = false;

        // when collapsed threads are enabled, we start with root-post counts from channels, then
        // add the same thread-reply counts from the global threads view
        if (collapsedThreads) {
            Object.values(threadCounts).forEach((c) => {
                anyUnreadThreads = anyUnreadThreads || Boolean(c.total_unread_threads);
                totalUnreadMentions += c.total_unread_mentions;
            });
        }

        return totalUnreadMentions || anyUnreadThreads || Boolean(totalUnreadMessages);
    },
);

export const getUnreadStatusInCurrentTeam: (state: GlobalState) => BasicUnreadStatus = createSelector(
    'getUnreadStatusInCurrentTeam',
    getCurrentChannelId,
    getMyChannels,
    getMyChannelMemberships,
    getChannelMessageCounts,
    getUsers,
    getCurrentUserId,
    getCurrentTeamId,
    isCollapsedThreadsEnabled,
    getThreadCounts,
    (
        currentChannelId,
        channels,
        myMembers,
        messageCounts,
        users,
        currentUserId,
        currentTeamId,
        collapsedThreads,
        threadCounts,
    ) => {
        const {
            messages: currentTeamUnreadMessages,
            mentions: currentTeamUnreadMentions,
        } = channels.reduce((counts, channel) => {
            const m = myMembers[channel.id];

            if (!m || channel.id === currentChannelId) {
                return counts;
            }

            const channelExists = channel.type === General.DM_CHANNEL ? users[getUserIdFromChannelName(currentUserId, channel.name)]?.delete_at === 0 : channel.delete_at === 0;
            if (!channelExists) {
                return counts;
            }

            const mentions = collapsedThreads ? m.mention_count_root : m.mention_count;
            if (mentions) {
                counts.mentions += mentions;
            }

            const unreadCount = calculateUnreadCount(messageCounts[channel.id], m, collapsedThreads);
            if (unreadCount.showUnread) {
                counts.messages += unreadCount.messages;
            }

            return counts;
        }, {
            messages: 0,
            mentions: 0,
        });

        let totalUnreadMentions = currentTeamUnreadMentions;
        let anyUnreadThreads = false;

        // when collapsed threads are enabled, we start with root-post counts from channels, then
        // add the same thread-reply counts from the global threads view IF we're not in global threads
        if (collapsedThreads && currentChannelId) {
            const c = threadCounts[currentTeamId];
            if (c) {
                anyUnreadThreads = anyUnreadThreads || Boolean(c.total_unread_threads);
                totalUnreadMentions += c.total_unread_mentions;
            }
        }

        return totalUnreadMentions || anyUnreadThreads || Boolean(currentTeamUnreadMessages);
    },
);

export const canManageChannelMembers: (state: GlobalState) => boolean = createSelector(
    'canManageChannelMembers',
    getCurrentChannel,
    getCurrentUser,
    getCurrentTeamMembership,
    getMyCurrentChannelMembership,
    getConfig,
    getLicense,
    hasNewPermissions,
    (state: GlobalState): boolean => haveICurrentChannelPermission(state,
        Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS,
    ),
    (state: GlobalState): boolean => haveICurrentChannelPermission(state,
        Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS,
    ),
    (
        channel: Channel,
        user: UserProfile,
        teamMembership: TeamMembership,
        channelMembership: ChannelMembership | undefined,
        config: Partial<ClientConfig>,
        license: any,
        newPermissions: boolean,
        managePrivateMembers: boolean,
        managePublicMembers: boolean,
    ): boolean => {
        if (!channel) {
            return false;
        }

        if (channel.delete_at !== 0) {
            return false;
        }

        if (channel.type === General.DM_CHANNEL || channel.type === General.GM_CHANNEL || channel.name === General.DEFAULT_CHANNEL) {
            return false;
        }

        if (newPermissions) {
            if (channel.type === General.OPEN_CHANNEL) {
                return managePublicMembers;
            } else if (channel.type === General.PRIVATE_CHANNEL) {
                return managePrivateMembers;
            }

            return true;
        }

        if (!channelMembership) {
            return false;
        }

        return canManageMembersOldPermissions(channel, user, teamMembership, channelMembership, config, license);
    },
);

// Determine if the user has permissions to manage members in at least one channel of the current team
export const canManageAnyChannelMembersInCurrentTeam: (state: GlobalState) => boolean = createSelector(
    'canManageAnyChannelMembersInCurrentTeam',
    getMyChannelMemberships,
    getCurrentTeamId,
    (state: GlobalState): GlobalState => state,
    (members: RelationOneToOne<Channel, ChannelMembership>, currentTeamId: string, state: GlobalState): boolean => {
        for (const channelId of Object.keys(members)) {
            const channel = getChannel(state, channelId);

            if (!channel || channel.team_id !== currentTeamId) {
                continue;
            }

            if (channel.type === General.OPEN_CHANNEL && haveIChannelPermission(state,
                currentTeamId,
                channelId,
                Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS,
            )) {
                return true;
            } else if (channel.type === General.PRIVATE_CHANNEL && haveIChannelPermission(state,
                currentTeamId,
                channelId,
                Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS,
            )) {
                return true;
            }
        }

        return false;
    },
);

export const getAllDirectChannelIds: (state: GlobalState) => string[] = createIdsSelector(
    'getAllDirectChannelIds',
    getDirectChannelsSet,
    (directIds: Set<string>): string[] => {
        return Array.from(directIds);
    },
);

export const getChannelIdsInCurrentTeam: (state: GlobalState) => string[] = createIdsSelector(
    'getChannelIdsInCurrentTeam',
    getCurrentTeamId,
    getChannelsInTeam,
    (currentTeamId: string, channelsInTeam: RelationOneToMany<Team, Channel>): string[] => {
        return Array.from(channelsInTeam[currentTeamId] || []);
    },
);

export const getChannelIdsForCurrentTeam: (state: GlobalState) => string[] = createIdsSelector(
    'getChannelIdsForCurrentTeam',
    getChannelIdsInCurrentTeam,
    getAllDirectChannelIds,
    (channels, direct) => {
        return [...channels, ...direct];
    },
);

export const getUnreadChannelIds: (state: GlobalState, lastUnreadChannel?: Channel | null) => string[] = createIdsSelector(
    'getUnreadChannelIds',
    isCollapsedThreadsEnabled,
    getMyChannelMemberships,
    getChannelMessageCounts,
    getChannelIdsForCurrentTeam,
    (state: GlobalState, lastUnreadChannel: Channel | undefined | null = null): Channel | undefined | null => lastUnreadChannel,
    (
        collapsedThreads,
        members: RelationOneToOne<Channel, ChannelMembership>,
        messageCounts: RelationOneToOne<Channel, ChannelMessageCount>,
        teamChannelIds: string[],
        lastUnreadChannel?: Channel | null,
    ): string[] => {
        const unreadIds = teamChannelIds.filter((id) => {
            return calculateUnreadCount(messageCounts[id], members[id], collapsedThreads).showUnread;
        });

        if (lastUnreadChannel && !unreadIds.includes(lastUnreadChannel.id)) {
            unreadIds.push(lastUnreadChannel.id);
        }

        return unreadIds;
    },
);

export const getUnreadChannels: (state: GlobalState, lastUnreadChannel?: Channel | null) => Channel[] = createIdsSelector(
    'getUnreadChannels',
    getCurrentUser,
    getUsers,
    getUserIdsInChannels,
    getAllChannels,
    getUnreadChannelIds,
    getTeammateNameDisplaySetting,
    (currentUser, profiles, userIdsInChannels: any, channels, unreadIds, settings) => {
        // If we receive an unread for a channel and then a mention the channel
        // won't be sorted correctly until we receive a message in another channel
        if (!currentUser) {
            return [];
        }

        const allUnreadChannels = unreadIds.filter((id) => channels[id] && channels[id].delete_at === 0).map((id) => {
            const c = channels[id];

            if (c.type === General.DM_CHANNEL || c.type === General.GM_CHANNEL) {
                return completeDirectChannelDisplayName(currentUser.id, profiles, userIdsInChannels[id], settings!, c);
            }

            return c;
        });
        return allUnreadChannels;
    },
);

// getDirectAndGroupChannels returns all direct and group channels, even if they have been manually
// or automatically closed.
//
// This is similar to the getAllDirectChannels above which actually also returns group channels,
// but suppresses manually closed group channels but not manually closed direct channels. This
// method does away with all the suppression, since the webapp client downstream uses this for
// the channel switcher and puts such suppressed channels in a separate category.
export const getDirectAndGroupChannels: (a: GlobalState) => Channel[] = createSelector(
    'getDirectAndGroupChannels',
    getCurrentUser,
    getUsers,
    getUserIdsInChannels,
    getAllChannels,
    getTeammateNameDisplaySetting,
    (currentUser: UserProfile, profiles: IDMappedObjects<UserProfile>, userIdsInChannels: any, channels: IDMappedObjects<Channel>, settings): Channel[] => {
        if (!currentUser) {
            return [];
        }

        return Object.keys(channels).
            map((key) => channels[key]).
            filter((channel: Channel): boolean => Boolean(channel)).
            filter((channel: Channel): boolean => channel.type === General.DM_CHANNEL || channel.type === General.GM_CHANNEL).
            map((channel: Channel): Channel => completeDirectChannelDisplayName(currentUser.id, profiles, userIdsInChannels[channel.id], settings!, channel));
    },
);

const getProfiles = (currentUserId: string, usersIdsInChannel: string[], users: IDMappedObjects<UserProfile>): UserProfile[] => {
    const profiles: UserProfile[] = [];
    usersIdsInChannel.forEach((userId) => {
        if (userId !== currentUserId) {
            profiles.push(users[userId]);
        }
    });
    return profiles;
};

export const getChannelsWithUserProfiles: (state: GlobalState) => Array<{
    profiles: UserProfile[];
} & Channel> = createSelector(
    'getChannelsWithUserProfiles',
    getUserIdsInChannels,
    getUsers,
    getGroupChannels,
    getCurrentUserId,
    (channelUserMap: RelationOneToMany<Channel, UserProfile>, users: IDMappedObjects<UserProfile>, channels: Channel[], currentUserId: string) => {
        return channels.map((channel: Channel): {
            profiles: UserProfile[];
        } & Channel => {
            const profiles = getProfiles(currentUserId, channelUserMap[channel.id] || [], users);
            return {
                ...channel,
                profiles,
            };
        });
    },
);

export const getDefaultChannelForTeams: (state: GlobalState) => RelationOneToOne<Team, Channel> = createSelector(
    'getDefaultChannelForTeams',
    getAllChannels,
    (channels: IDMappedObjects<Channel>): RelationOneToOne<Team, Channel> => {
        const result: RelationOneToOne<Team, Channel> = {};

        for (const channel of Object.keys(channels).map((key) => channels[key])) {
            if (channel && channel.name === General.DEFAULT_CHANNEL) {
                result[channel.team_id] = channel;
            }
        }

        return result;
    },
);

export const getMyFirstChannelForTeams: (state: GlobalState) => RelationOneToOne<Team, Channel> = createSelector(
    'getMyFirstChannelForTeams',
    getAllChannels,
    getMyChannelMemberships,
    getMyTeams,
    getCurrentUser,
    (allChannels: IDMappedObjects<Channel>, myChannelMemberships: RelationOneToOne<Channel, ChannelMembership>, myTeams: Team[], currentUser: UserProfile): RelationOneToOne<Team, Channel> => {
        const locale = currentUser.locale || General.DEFAULT_LOCALE;
        const result: RelationOneToOne<Team, Channel> = {};

        for (const team of myTeams) {
        // Get a sorted array of all channels in the team that the current user is a member of
            const teamChannels = Object.values(allChannels).filter((channel: Channel) => channel && channel.team_id === team.id && Boolean(myChannelMemberships[channel.id])).sort(sortChannelsByDisplayName.bind(null, locale));

            if (teamChannels.length === 0) {
                continue;
            }

            result[team.id] = teamChannels[0];
        }

        return result;
    },
);

export const getRedirectChannelNameForTeam = (state: GlobalState, teamId: string): string => {
    const defaultChannelForTeam = getDefaultChannelForTeams(state)[teamId];
    const myFirstChannelForTeam = getMyFirstChannelForTeams(state)[teamId];
    const canIJoinPublicChannelsInTeam = !hasNewPermissions(state) || haveITeamPermission(state,
        teamId,
        Permissions.JOIN_PUBLIC_CHANNELS,
    );
    const myChannelMemberships = getMyChannelMemberships(state);
    const iAmMemberOfTheTeamDefaultChannel = Boolean(defaultChannelForTeam && myChannelMemberships[defaultChannelForTeam.id]);

    if (iAmMemberOfTheTeamDefaultChannel || canIJoinPublicChannelsInTeam) {
        return General.DEFAULT_CHANNEL;
    }

    return (myFirstChannelForTeam && myFirstChannelForTeam.name) || General.DEFAULT_CHANNEL;
};

// isManually unread looks into state if the provided channelId is marked as unread by the user.
export function isManuallyUnread(state: GlobalState, channelId?: string): boolean {
    if (!channelId) {
        return false;
    }

    return Boolean(state.entities.channels.manuallyUnread[channelId]);
}

export function getChannelModerations(state: GlobalState, channelId: string): ChannelModeration[] {
    return state.entities.channels.channelModerations[channelId];
}

export function getChannelMemberCountsByGroup(state: GlobalState, channelId: string): ChannelMemberCountsByGroup {
    return state.entities.channels.channelMemberCountsByGroup[channelId] || {};
}

export function isFavoriteChannel(state: GlobalState, channelId: string): boolean {
    const channel = getChannel(state, channelId);
    if (!channel) {
        return false;
    }

    const category = getCategoryInTeamByType(state, channel.team_id || getCurrentTeamId(state), CategoryTypes.FAVORITES);

    if (!category) {
        return false;
    }

    return category.channel_ids.includes(channel.id);
}

export function filterChannelList(channelList: Channel[], filters: ChannelSearchOpts): Channel[] {
    if (!filters || (!filters.private && !filters.public && !filters.deleted && !filters.team_ids)) {
        return channelList;
    }
    let result: Channel[] = [];
    const channelType: string[] = [];
    const channels = channelList;
    if (filters.public) {
        channelType.push(Constants.OPEN_CHANNEL);
    }
    if (filters.private) {
        channelType.push(Constants.PRIVATE_CHANNEL);
    }
    if (filters.deleted) {
        channelType.push(Constants.ARCHIVED_CHANNEL);
    }
    channelType.forEach((type) => {
        result = result.concat(channels.filter((channel) => channel.type === type));
    });
    if (filters.team_ids && filters.team_ids.length > 0) {
        let teamResult: Channel[] = [];
        filters.team_ids.forEach((id) => {
            if (channelType.length > 0) {
                const filterResult = result.filter((channel) => channel.team_id === id);
                teamResult = teamResult.concat(filterResult);
            } else {
                teamResult = teamResult.concat(channels.filter((channel) => channel.team_id === id));
            }
        });
        result = teamResult;
    }
    return result;
}
export function searchChannelsInPolicy(state: GlobalState, policyId: string, term: string, filters: ChannelSearchOpts): Channel[] {
    const channelsInPolicy = getChannelsInPolicy();
    const channelArray = channelsInPolicy(state, {policyId});
    let channels = filterChannelList(channelArray, filters);
    channels = filterChannelsMatchingTerm(channels, term);

    return channels;
}

export function getDirectTeammate(state: GlobalState, channelId: string): UserProfile | undefined {
    const channel = getChannel(state, channelId);
    if (!channel) {
        return undefined;
    }

    const userIds = channel.name.split('__');
    const currentUserId = getCurrentUserId(state);

    if (userIds.length !== 2 || userIds.indexOf(currentUserId) === -1) {
        return undefined;
    }

    if (userIds[0] === userIds[1]) {
        return getUser(state, userIds[0]);
    }

    for (const id of userIds) {
        if (id !== currentUserId) {
            return getUser(state, id);
        }
    }

    return undefined;
}
