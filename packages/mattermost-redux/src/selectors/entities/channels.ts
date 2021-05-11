// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {General, Permissions} from 'mattermost-redux/constants';
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
import {getLastPostPerChannel} from 'mattermost-redux/selectors/entities/posts';
import {
    getFavoritesPreferences,
    getMyPreferences,
    getTeammateNameDisplaySetting,
    getVisibleTeammate,
    getVisibleGroupIds,
} from 'mattermost-redux/selectors/entities/preferences';
import {haveICurrentChannelPermission, haveIChannelPermission, haveITeamPermission} from 'mattermost-redux/selectors/entities/roles';
import {
    getCurrentTeamId,
    getCurrentTeamMembership,
    getMyTeams,
    getTeamMemberships,
} from 'mattermost-redux/selectors/entities/teams';
import {isCurrentUserSystemAdmin, getCurrentUserId, getUserIdsInChannels, getStatusForUserId} from 'mattermost-redux/selectors/entities/users';

import {Channel, ChannelStats, ChannelMembership, ChannelModeration, ChannelMemberCountsByGroup} from 'mattermost-redux/types/channels';
import {ClientConfig} from 'mattermost-redux/types/config';
import {Post} from 'mattermost-redux/types/posts';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import {GlobalState} from 'mattermost-redux/types/store';
import {TeamMembership, Team} from 'mattermost-redux/types/teams';
import {UsersState, UserProfile} from 'mattermost-redux/types/users';
import {
    $ID,
    IDMappedObjects,
    NameMappedObjects,
    RelationOneToMany,
    RelationOneToOne,
    UserIDMappedObjects,
} from 'mattermost-redux/types/utilities';

import {
    canManageMembersOldPermissions,
    completeDirectChannelInfo,
    newCompleteDirectChannelInfo,
    completeDirectChannelDisplayName,
    getUserIdFromChannelName,
    getChannelByName as getChannelByNameHelper,
    isChannelMuted,
    getDirectChannelName,
    isAutoClosed,
    isDirectChannelVisible,
    isGroupChannelVisible,
    sortChannelsByDisplayName,
    isFavoriteChannelOld,
    isDefault,
    sortChannelsByRecency,
    isDirectChannel,
} from 'mattermost-redux/utils/channel_utils';
import {createIdsSelector} from 'mattermost-redux/utils/helpers';

export {getCurrentChannelId, getMyChannelMemberships, getMyCurrentChannelMembership};

type SortingType = 'recent' | 'alpha';

export function getAllChannels(state: GlobalState): IDMappedObjects<Channel> {
    return state.entities.channels.channels;
}

export function getAllChannelStats(state: GlobalState): RelationOneToOne<Channel, ChannelStats> {
    return state.entities.channels.stats;
}

export function getChannelsInTeam(state: GlobalState): RelationOneToMany<Team, Channel> {
    return state.entities.channels.channelsInTeam;
}

export function getChannelsInPolicy(state: GlobalState): IDMappedObjects<Channel> {
    return state.entities.channels.channelsInPolicy;
}

export const getDirectChannelsSet: (state: GlobalState) => Set<string> = createSelector(
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

function sortChannelsByRecencyOrAlpha(locale: string, lastPosts: RelationOneToOne<Channel, Post>, sorting: SortingType, a: Channel, b: Channel) {
    if (sorting === 'recent') {
        return sortChannelsByRecency(lastPosts, a, b);
    }

    return sortChannelsByDisplayName(locale, a, b);
}

// mapAndSortChannelIds sorts channels, primarily by:
//   For all sections except unreads:
//     a. All other unread channels
//     b. Muted channels
//   For unreads section:
//     a. Non-muted channels with mentions
//     b. Muted channels with mentions
//     c. Remaining unread channels
//   And then secondary by alphabetical ("alpha") or chronological ("recency") order
export const mapAndSortChannelIds = (
    channels: Channel[],
    currentUser: UserProfile,
    myMembers: RelationOneToOne<Channel, ChannelMembership>,
    lastPosts: RelationOneToOne<Channel, Post>,
    sorting: SortingType,
    sortMentionsFirst = false,
): string[] => {
    const locale = currentUser.locale || General.DEFAULT_LOCALE;

    const mutedChannelIds = channels.
        filter((channel) => isChannelMuted(myMembers[channel.id])).
        sort(sortChannelsByRecencyOrAlpha.bind(null, locale, lastPosts, sorting)).
        map((channel) => channel.id);

    let hasMentionedChannelIds: string[] = [];
    if (sortMentionsFirst) {
        hasMentionedChannelIds = channels.
            filter((channel) => {
                const member = myMembers[channel.id];
                return member && member.mention_count > 0 && !isChannelMuted(member);
            }).
            sort(sortChannelsByRecencyOrAlpha.bind(null, locale, lastPosts, sorting)).
            map((channel) => channel.id);
    }

    const otherChannelIds = channels.
        filter((channel) => {
            return !mutedChannelIds.includes(channel.id) && !hasMentionedChannelIds.includes(channel.id);
        }).
        sort(sortChannelsByRecencyOrAlpha.bind(null, locale, lastPosts, sorting)).
        map((channel) => channel.id);

    return sortMentionsFirst ? hasMentionedChannelIds.concat(mutedChannelIds, otherChannelIds) : otherChannelIds.concat(mutedChannelIds);
};

export function filterChannels(
    unreadIds: string[],
    favoriteIds: string[],
    channelIds: string[],
    unreadsAtTop: boolean,
    favoritesAtTop: boolean,
): string[] {
    let channels: string[] = channelIds;

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

// makeGetChannel returns a selector that returns a channel from the store with the following filled in for DM/GM channels:
// - The display_name set to the other user(s) names, following the Teammate Name Display setting
// - The teammate_id for DM channels
// - The status of the other user in a DM channel
export function makeGetChannel(): (state: GlobalState, props: {id: string}) => Channel {
    return createSelector(
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

// makeGetChannelsForIds returns a selector that, given an array of channel IDs, returns a list of the corresponding
// channels. Channels are returned in the same order as the given IDs with undefined entries replacing any invalid IDs.
// Note that memoization will fail if an array literal is passed in.
export function makeGetChannelsForIds(): (state: GlobalState, ids: string[]) => Channel[] {
    return createSelector(
        getAllChannels,
        (state: GlobalState, ids: string[]) => ids,
        (allChannels, ids) => {
            return ids.map((id) => allChannels[id]);
        },
    );
}

export const getCurrentChannel: (state: GlobalState) => Channel = createSelector(
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

export const getMyChannelMember: (state: GlobalState, channelId: string) => ChannelMembership | undefined | null = createSelector(
    getMyChannelMemberships,
    (state: GlobalState, channelId: string): string => channelId,
    (channelMemberships: RelationOneToOne<Channel, ChannelMembership>, channelId: string): ChannelMembership | undefined | null => {
        return channelMemberships[channelId] || null;
    },
);

export const getCurrentChannelStats: (state: GlobalState) => ChannelStats = createSelector(
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
    getMyCurrentChannelMembership,
    (membership?: ChannelMembership): boolean => {
        if (!membership) {
            return false;
        }

        return isChannelMuted(membership);
    },
);

export const isCurrentChannelArchived: (state: GlobalState) => boolean = createSelector(
    getCurrentChannel,
    (channel: Channel): boolean => channel.delete_at !== 0,
);

export const isCurrentChannelDefault: (state: GlobalState) => boolean = createSelector(
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

export function shouldHideDefaultChannel(state: GlobalState, channel: Channel): boolean {
    return channel && channel.name === General.DEFAULT_CHANNEL && !isCurrentUserSystemAdmin(state) && getConfig(state).ExperimentalHideTownSquareinLHS === 'true';
}

export const countCurrentChannelUnreadMessages: (state: GlobalState) => number = createSelector(
    getCurrentChannel,
    getMyCurrentChannelMembership,
    (channel: Channel, membership?: ChannelMembership): number => {
        if (!membership) {
            return 0;
        }
        return channel.total_msg_count - membership.msg_count;
    },
);

export function getChannelByName(state: GlobalState, channelName: string): Channel | undefined | null {
    return getChannelByNameHelper(getAllChannels(state), channelName);
}

export const getChannelSetInCurrentTeam: (state: GlobalState) => string[] = createSelector(
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

// Returns both DMs and GMs
export const getAllDirectChannels: (state: GlobalState) => Channel[] = createSelector(
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
    getChannelsInCurrentTeam,
    getAllDirectChannels,
    getMyChannelMemberships,
    (channels: Channel[], directChannels: Channel[], myMembers: RelationOneToOne<Channel, ChannelMembership>): Channel[] => {
        return [...channels, ...directChannels].filter((c) => myMembers.hasOwnProperty(c.id));
    },
);

export const getOtherChannels: (state: GlobalState, archived?: boolean | null) => Channel[] = createSelector(
    getChannelsInCurrentTeam,
    getMyChannelMemberships,
    (state: GlobalState, archived: boolean | undefined | null = true) => archived,
    (channels: Channel[], myMembers: RelationOneToOne<Channel, ChannelMembership>, archived?: boolean | null): Channel[] => {
        return channels.filter((c) => !myMembers.hasOwnProperty(c.id) && c.type === General.OPEN_CHANNEL && (archived ? true : c.delete_at === 0));
    },
);

export const getDefaultChannel: (state: GlobalState) => Channel | undefined | null = createSelector(
    getAllChannels,
    getCurrentTeamId,
    (channels: IDMappedObjects<Channel>, teamId: string): Channel | undefined | null => {
        return Object.keys(channels).map((key) => channels[key]).find((c) => c && c.team_id === teamId && c.name === General.DEFAULT_CHANNEL);
    },
);

export const getMembersInCurrentChannel: (state: GlobalState) => UserIDMappedObjects<ChannelMembership> = createSelector(
    getCurrentChannelId,
    getChannelMembersInChannels,
    (currentChannelId: string, members: RelationOneToOne<Channel, UserIDMappedObjects<ChannelMembership>>): UserIDMappedObjects<ChannelMembership> => {
        return members[currentChannelId];
    },
);

export const getUnreads: (state: GlobalState) => {
    messageCount: number;
    mentionCount: number;
} = createSelector(
    getAllChannels,
    getMyChannelMemberships,
    getUsers,
    getCurrentUserId,
    getCurrentTeamId,
    getMyTeams,
    getTeamMemberships,
    (channels: IDMappedObjects<Channel>, myMembers: RelationOneToOne<Channel, ChannelMembership>, users: IDMappedObjects<UserProfile>, currentUserId: string, currentTeamId: string, myTeams: Team[], myTeamMemberships: RelationOneToOne<Team, TeamMembership>): {
        messageCount: number;
        mentionCount: number;
    } => {
        let messageCountForCurrentTeam = 0; // Includes message count from channels of current team plus all GM'S and all DM's across teams
        let mentionCountForCurrentTeam = 0; // Includes mention count from channels of current team plus all GM'S and all DM's across teams

        Object.keys(myMembers).forEach((channelId) => {
            const channel = channels[channelId];
            const m = myMembers[channelId];

            if (!channel || !m) {
                return;
            }

            if (channel.team_id !== currentTeamId && channel.type !== General.DM_CHANNEL && channel.type !== General.GM_CHANNEL) {
                return;
            }

            let otherUserId = '';

            if (channel.type === General.DM_CHANNEL) {
                otherUserId = getUserIdFromChannelName(currentUserId, channel.name);

                if (users[otherUserId] && users[otherUserId].delete_at === 0) {
                    mentionCountForCurrentTeam += m.mention_count;
                }
            } else if (m.mention_count > 0 && channel.delete_at === 0) {
                mentionCountForCurrentTeam += m.mention_count;
            }

            if (m.notify_props && m.notify_props.mark_unread !== 'mention' && channel.total_msg_count - m.msg_count > 0) {
                if (channel.type === General.DM_CHANNEL) {
                    // otherUserId is guaranteed to have been set above
                    if (users[otherUserId] && users[otherUserId].delete_at === 0) {
                        messageCountForCurrentTeam += 1;
                    }
                } else if (channel.delete_at === 0) {
                    messageCountForCurrentTeam += 1;
                }
            }
        });

        // Includes mention count and message count from teams other than the current team
        // This count does not include GM's and DM's
        const otherTeamsUnreadCountForChannels = myTeams.reduce((acc, team) => {
            if (currentTeamId !== team.id) {
                const member = myTeamMemberships[team.id];
                acc.messageCount += member.msg_count;
                acc.mentionCount += member.mention_count;
            }

            return acc;
        }, {
            messageCount: 0,
            mentionCount: 0,
        });

        // messageCount is the number of unread channels, mention count is the total number of mentions
        return {
            messageCount: messageCountForCurrentTeam + otherTeamsUnreadCountForChannels.messageCount,
            mentionCount: mentionCountForCurrentTeam + otherTeamsUnreadCountForChannels.mentionCount,
        };
    },
);

export const getUnreadsInCurrentTeam: (a: GlobalState) => {
    messageCount: number;
    mentionCount: number;
} = createSelector(getCurrentChannelId, getMyChannels, getMyChannelMemberships, getUsers, getCurrentUserId, (currentChannelId: string, channels: Channel[], myMembers: RelationOneToOne<Channel, ChannelMembership>, users: IDMappedObjects<UserProfile>, currentUserId: string): {
    messageCount: number;
    mentionCount: number;
} => {
    let messageCount = 0;
    let mentionCount = 0;
    channels.forEach((channel) => {
        const m = myMembers[channel.id];

        if (m && channel.id !== currentChannelId) {
            let otherUserId = '';

            if (channel.type === 'D') {
                otherUserId = getUserIdFromChannelName(currentUserId, channel.name);

                if (users[otherUserId] && users[otherUserId].delete_at === 0) {
                    mentionCount += channel.total_msg_count - m.msg_count;
                }
            } else if (m.mention_count > 0 && channel.delete_at === 0) {
                mentionCount += m.mention_count;
            }

            if (m.notify_props && m.notify_props.mark_unread !== 'mention' && channel.total_msg_count - m.msg_count > 0) {
                if (channel.type === 'D') {
                    if (users[otherUserId] && users[otherUserId].delete_at === 0) {
                        messageCount += 1;
                    }
                } else if (channel.delete_at === 0) {
                    messageCount += 1;
                }
            }
        }
    });
    return {
        messageCount,
        mentionCount,
    };
});

export const canManageChannelMembers: (state: GlobalState) => boolean = createSelector(
    getCurrentChannel,
    getCurrentUser,
    getCurrentTeamMembership,
    getMyCurrentChannelMembership,
    getConfig,
    getLicense,
    hasNewPermissions,
    (state: GlobalState): boolean => haveICurrentChannelPermission(state, {
        permission: Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS,
    }),
    (state: GlobalState): boolean => haveICurrentChannelPermission(state, {
        permission: Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS,
    }),
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
    getMyChannelMemberships,
    getCurrentTeamId,
    (state: GlobalState): GlobalState => state,
    (members: RelationOneToOne<Channel, ChannelMembership>, currentTeamId: string, state: GlobalState): boolean => {
        for (const channelId of Object.keys(members)) {
            const channel = getChannel(state, channelId);

            if (!channel || channel.team_id !== currentTeamId) {
                continue;
            }

            if (channel.type === General.OPEN_CHANNEL && haveIChannelPermission(state, {
                permission: Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS,
                channel: channelId,
                team: currentTeamId,
            })) {
                return true;
            } else if (channel.type === General.PRIVATE_CHANNEL && haveIChannelPermission(state, {
                permission: Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS,
                channel: channelId,
                team: currentTeamId,
            })) {
                return true;
            }
        }

        return false;
    },
);

export const getAllDirectChannelIds: (state: GlobalState) => string[] = createIdsSelector(
    getDirectChannelsSet,
    (directIds: Set<string>): string[] => {
        return Array.from(directIds);
    },
);

export const getChannelIdsInCurrentTeam: (state: GlobalState) => string[] = createIdsSelector(
    getCurrentTeamId,
    getChannelsInTeam,
    (currentTeamId: string, channelsInTeam: RelationOneToMany<Team, Channel>): string[] => {
        return Array.from(channelsInTeam[currentTeamId] || []);
    },
);

export const getChannelIdsForCurrentTeam: (state: GlobalState) => string[] = createIdsSelector(
    getChannelIdsInCurrentTeam,
    getAllDirectChannelIds,
    (channels, direct) => {
        return [...channels, ...direct];
    },
);

export const getUnreadChannelIds: (state: GlobalState, lastUnreadChannel?: Channel | null) => string[] = createIdsSelector(
    getAllChannels,
    getMyChannelMemberships,
    getChannelIdsForCurrentTeam,
    (state: GlobalState, lastUnreadChannel: Channel | undefined | null = null): Channel | undefined | null => lastUnreadChannel,
    (channels: IDMappedObjects<Channel>, members: RelationOneToOne<Channel, ChannelMembership>, teamChannelIds: string[], lastUnreadChannel?: Channel | null): string[] => {
        const unreadIds = teamChannelIds.filter((id) => {
            const c = channels[id];
            const m = members[id];

            if (c && m) {
                const chHasUnread = c.total_msg_count - m.msg_count > 0;
                const chHasMention = m.mention_count > 0;

                if ((m.notify_props && m.notify_props.mark_unread !== 'mention' && chHasUnread) || chHasMention) {
                    return true;
                }
            }

            return false;
        });

        if (lastUnreadChannel && !unreadIds.includes(lastUnreadChannel.id)) {
            unreadIds.push(lastUnreadChannel.id);
        }

        return unreadIds;
    },
);

export const getUnreadChannels: (state: GlobalState, lastUnreadChannel?: Channel | null) => Channel[] = createIdsSelector(
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

export const getMapAndSortedUnreadChannelIds: (state: GlobalState, lastUnreadChannel: Channel, sorting: SortingType) => string[] = createIdsSelector(
    getUnreadChannels,
    getCurrentUser,
    getMyChannelMemberships,
    getLastPostPerChannel,
    (state: GlobalState, lastUnreadChannel: Channel, sorting: SortingType = 'alpha') => sorting,
    (channels, currentUser, myMembers, lastPosts: RelationOneToOne<Channel, Post>, sorting: SortingType) => {
        return mapAndSortChannelIds(channels, currentUser, myMembers, lastPosts, sorting, true);
    },
);

export const getSortedUnreadChannelIds: (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType) => string[] = createIdsSelector(
    getUnreadChannelIds,
    (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType = 'alpha') => {
        return getMapAndSortedUnreadChannelIds(state, lastUnreadChannel, sorting);
    },
    (unreadChannelIds, mappedAndSortedUnreadChannelIds) => mappedAndSortedUnreadChannelIds,
);

//recent channels

export const getAllRecentChannels: (state: GlobalState) => Channel[] = createSelector(
    getUsers,
    getCurrentUser,
    getAllChannels,
    getUserIdsInChannels,
    getLastPostPerChannel,
    getMyChannelMemberships,
    getChannelIdsForCurrentTeam,
    getTeammateNameDisplaySetting,
    (profiles, currentUser: UserProfile, channels: IDMappedObjects<Channel>, userIdsInChannels: any,
        lastPosts: RelationOneToOne<Channel, Post>,
        members: RelationOneToOne<Channel, ChannelMembership>,
        teamChannelIds: string[],
        settings,
    ): Channel[] => {
        const sorting = 'recent';
        const recentIds = teamChannelIds.filter((id) => {
            const c = channels[id];
            const m = members[id];

            return Boolean(c && m);
        });

        if (!currentUser) {
            return [];
        }

        const Channels = recentIds.filter((id) => channels[id] && channels[id].delete_at === 0).map((id) => {
            const c = channels[id];

            if (c.type === General.DM_CHANNEL || c.type === General.GM_CHANNEL) {
                return completeDirectChannelDisplayName(currentUser.id, profiles, userIdsInChannels[id], settings!, c);
            }

            return c;
        });

        const locale = currentUser.locale || General.DEFAULT_LOCALE;
        const recentChannels = Channels.
            sort(sortChannelsByRecencyOrAlpha.bind(null, locale, lastPosts, sorting));
        return recentChannels;
    },
);

// Favorites

export const getFavoriteChannels: (state: GlobalState) => Channel[] = createIdsSelector(
    getCurrentUser,
    getUsers,
    getUserIdsInChannels,
    getAllChannels,
    getMyChannelMemberships,
    getFavoritesPreferences,
    getChannelIdsForCurrentTeam,
    getTeammateNameDisplaySetting,
    getConfig,
    getMyPreferences,
    getCurrentChannelId,
    (
        currentUser: UserProfile,
        profiles: IDMappedObjects<UserProfile>,
        userIdsInChannels: any,
        channels: IDMappedObjects<Channel>,
        myMembers: RelationOneToOne<Channel, ChannelMembership>,
        favoriteIds: string[],
        teamChannelIds: string[],
        settings: string,
        config: Partial<ClientConfig>,
        prefs: {
            [x: string]: PreferenceType;
        },
        currentChannelId: string,
    ): Channel[] => {
        if (!currentUser) {
            return [];
        }

        const favoriteChannel = favoriteIds.filter((id) => {
            if (!myMembers[id] || !channels[id]) {
                return false;
            }

            const channel = channels[id];
            const otherUserId = getUserIdFromChannelName(currentUser.id, channel.name);

            if (channel.delete_at !== 0 && channel.id !== currentChannelId) {
                return false;
            }

            // Deleted users from CLI will not have a profiles entry

            if (channel.type === General.DM_CHANNEL && !profiles[otherUserId]) {
                return false;
            }

            if (channel.type === General.DM_CHANNEL && !isDirectChannelVisible(profiles[otherUserId] || otherUserId, config, prefs, channel, null, false, currentChannelId)) {
                return false;
            } else if (channel.type === General.GM_CHANNEL && !isGroupChannelVisible(config, prefs, channel)) {
                return false;
            }

            return teamChannelIds.includes(id);
        }).map((id) => {
            const c = channels[id];

            if (c.type === General.DM_CHANNEL || c.type === General.GM_CHANNEL) {
                return completeDirectChannelDisplayName(currentUser.id, profiles, userIdsInChannels[id], settings, c);
            }

            return c;
        });

        return favoriteChannel;
    },
);

export const getFavoriteChannelIds: (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType) => string[] = createIdsSelector(
    getFavoriteChannels,
    getCurrentUser,
    getMyChannelMemberships,
    getLastPostPerChannel,
    (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType = 'alpha') => sorting,
    mapAndSortChannelIds,
);

export const getSortedFavoriteChannelIds: (state: GlobalState, lastUnreadChannel: Channel, favoritesAtTop: boolean, unreadsAtTop: boolean, sorting: SortingType) => string[] = createIdsSelector(
    getUnreadChannelIds,
    getFavoritesPreferences,
    (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType) => getFavoriteChannelIds(state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting),
    (state, lastUnreadChannel, unreadsAtTop = true) => unreadsAtTop,
    (unreadChannelIds, favoritePreferences, favoriteChannelIds, unreadsAtTop) => {
        return filterChannels(unreadChannelIds, favoritePreferences, favoriteChannelIds, unreadsAtTop, false);
    },
);

// Public Channels
export const getPublicChannels: (state: GlobalState) => Channel[] = createSelector(
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

export const getPublicChannelIds: (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType) => string[] = createIdsSelector(
    getPublicChannels,
    getCurrentUser,
    getMyChannelMemberships,
    getLastPostPerChannel,
    (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType = 'alpha') => sorting,
    mapAndSortChannelIds,
);

export const getSortedPublicChannelIds: (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType) => string[] = createIdsSelector(
    getUnreadChannelIds,
    getFavoritesPreferences,
    (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType = 'alpha') => getPublicChannelIds(state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting),
    (state, lastUnreadChannel, unreadsAtTop = true) => unreadsAtTop,
    (state, lastUnreadChannel, unreadsAtTop, favoritesAtTop = true) => favoritesAtTop,
    filterChannels,
);

// Private Channels

export const getPrivateChannels: (a: GlobalState) => Channel[] = createSelector(
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
            return teamChannelIds.includes(id) && channel.type === General.PRIVATE_CHANNEL;
        }).map((id) => channels[id]);

        return privateChannels;
    },
);

export const getPrivateChannelIds: (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType) => string[] = createIdsSelector(
    getPrivateChannels,
    getCurrentUser,
    getMyChannelMemberships,
    getLastPostPerChannel,
    (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType = 'alpha') => sorting,
    mapAndSortChannelIds,
);

export const getSortedPrivateChannelIds: (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType) => string[] = createIdsSelector(
    getUnreadChannelIds,
    getFavoritesPreferences,
    (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType = 'alpha') => getPrivateChannelIds(state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting),
    (state, lastUnreadChannel, unreadsAtTop = true) => unreadsAtTop,
    (state, lastUnreadChannel, unreadsAtTop, favoritesAtTop = true) => favoritesAtTop,
    filterChannels,
);

// Direct Messages

export const getDirectChannels: (state: GlobalState) => Channel[] = createSelector(
    getCurrentUser,
    getUsers,
    getUserIdsInChannels,
    getAllChannels,
    getVisibleTeammate,
    getVisibleGroupIds,
    getTeammateNameDisplaySetting,
    getConfig,
    getMyPreferences,
    getLastPostPerChannel,
    getCurrentChannelId,
    (
        currentUser: UserProfile,
        profiles: IDMappedObjects<UserProfile>,
        userIdsInChannels: any,
        channels: IDMappedObjects<Channel>,
        teammates: string[],
        groupIds: string[],
        settings,
        config,
        preferences: {
            [x: string]: PreferenceType;
        },
        lastPosts: RelationOneToOne<Channel, Post>,
        currentChannelId: string,
    ): Channel[] => {
        if (!currentUser) {
            return [];
        }

        const channelValues = Object.keys(channels).map((key) => channels[key]);
        const directChannelsIds: string[] = [];
        teammates.reduce((result, teammateId) => {
            const name = getDirectChannelName(currentUser.id, teammateId);
            const channel = channelValues.find((c: Channel) => c && c.name === name); //eslint-disable-line max-nested-callbacks

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

            if (channel && (channel.type === General.DM_CHANNEL || channel.type === General.GM_CHANNEL)) {
                const lastPost = lastPosts[channel.id];
                return !isAutoClosed(config, preferences, channels[id], lastPost ? lastPost.create_at : 0, 0, currentChannelId);
            }

            return false;
        }).concat(directChannelsIds).map((id) => {
            const channel = channels[id];
            return completeDirectChannelDisplayName(currentUser.id, profiles, userIdsInChannels[id], settings!, channel);
        });
        return directChannels;
    },
);

// getDirectAndGroupChannels returns all direct and group channels, even if they have been manually
// or automatically closed.
//
// This is similar to the getDirectChannels above (which actually also returns group channels,
// but suppresses manually closed group channels but not manually closed direct channels.) This
// method does away with all the suppression, since the webapp client downstream uses this for
// the channel switcher and puts such suppressed channels in a separate category.
export const getDirectAndGroupChannels: (a: GlobalState) => Channel[] = createSelector(
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

export const getDirectChannelIds: (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType) => string[] = createIdsSelector(
    getDirectChannels,
    getCurrentUser,
    getMyChannelMemberships,
    getLastPostPerChannel,
    (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType = 'alpha') => sorting,
    (directChannels, currentUser, myChannelMemberships, lastPostPerChannel, sorting) => {
        return mapAndSortChannelIds(directChannels, currentUser, myChannelMemberships, lastPostPerChannel, sorting);
    },
);

export const getSortedDirectChannelIds: (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType) => Array<$ID<Channel>> = createIdsSelector(
    getUnreadChannelIds,
    getFavoritesPreferences,
    (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType = 'alpha') => getDirectChannelIds(state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting),
    (state, lastUnreadChannel, unreadsAtTop = true) => unreadsAtTop,
    (state, lastUnreadChannel, unreadsAtTop, favoritesAtTop = true) => favoritesAtTop,
    (unreadChannelIds, favoritesPreferences, directChannelIds, unreadsAtTop, favoritesAtTop) => {
        return filterChannels(unreadChannelIds, favoritesPreferences, directChannelIds, unreadsAtTop, favoritesAtTop);
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

const getAllActiveChannels = createSelector(
    getPublicChannels,
    getPrivateChannels,
    getDirectChannels,
    (publicChannels, privateChannels, directChannels) => {
        const allChannels = [...publicChannels, ...privateChannels, ...directChannels];
        return allChannels;
    },
);

export const getAllChannelIds: (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType) => string[] = createIdsSelector(
    getAllActiveChannels,
    getCurrentUser,
    getMyChannelMemberships,
    getLastPostPerChannel,
    (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType = 'alpha') => sorting,
    mapAndSortChannelIds,
);

export const getAllSortedChannelIds: (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType) => string[] = createIdsSelector(
    getUnreadChannelIds,
    getFavoritesPreferences,
    (state: GlobalState, lastUnreadChannel: Channel, unreadsAtTop: boolean, favoritesAtTop: boolean, sorting: SortingType = 'alpha') => getAllChannelIds(state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting),
    (state, lastUnreadChannel, unreadsAtTop = true) => unreadsAtTop,
    (state, lastUnreadChannel, unreadsAtTop, favoritesAtTop = true) => favoritesAtTop,
    filterChannels,
);

type ChannelsByCategory = {
    type: string;
    name: string;
    items: string[];
};

let lastChannels: ChannelsByCategory[];

const haveChannelsChanged = (channels: ChannelsByCategory[]) => {
    if (!lastChannels || lastChannels.length !== channels.length) {
        return true;
    }

    for (let i = 0; i < channels.length; i++) {
        if (channels[i].type !== lastChannels[i].type || channels[i].items !== lastChannels[i].items) {
            return true;
        }
    }

    return false;
};

export const getOrderedChannelIds = (state: GlobalState, lastUnreadChannel: Channel, grouping: 'by_type' | 'none', sorting: SortingType, unreadsAtTop: boolean, favoritesAtTop: boolean) => {
    const channels: ChannelsByCategory[] = [];

    if (grouping === 'by_type') {
        channels.push({
            type: 'public',
            name: 'PUBLIC CHANNELS',
            items: getSortedPublicChannelIds(state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting),
        });
        channels.push({
            type: 'private',
            name: 'PRIVATE CHANNELS',
            items: getSortedPrivateChannelIds(state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting),
        });
        channels.push({
            type: 'direct',
            name: 'DIRECT MESSAGES',
            items: getSortedDirectChannelIds(state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting),
        });
    } else {
        // Combine all channel types
        let type = 'alpha';
        let name = 'CHANNELS';

        if (sorting === 'recent') {
            type = 'recent';
            name = 'RECENT ACTIVITY';
        }

        channels.push({
            type,
            name,
            items: getAllSortedChannelIds(state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting),
        });
    }

    if (favoritesAtTop) {
        channels.unshift({
            type: 'favorite',
            name: 'FAVORITE CHANNELS',
            items: getSortedFavoriteChannelIds(state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting),
        });
    }

    if (unreadsAtTop) {
        channels.unshift({
            type: 'unreads',
            name: 'UNREADS',
            items: getSortedUnreadChannelIds(state, lastUnreadChannel, unreadsAtTop, favoritesAtTop, sorting),
        });
    }

    if (haveChannelsChanged(channels)) {
        lastChannels = channels;
    }

    return lastChannels;
};

export const getDefaultChannelForTeams: (state: GlobalState) => RelationOneToOne<Team, Channel> = createSelector(
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
    const canIJoinPublicChannelsInTeam = !hasNewPermissions(state) || haveITeamPermission(state, {
        team: teamId,
        permission: Permissions.JOIN_PUBLIC_CHANNELS,
    });
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
    const config = getConfig(state);
    if (config.EnableLegacySidebar === 'true') {
        return isFavoriteChannelOld(getMyPreferences(state), channelId);
    }

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
