// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {General, Preferences, Permissions, Users} from '../constants';
import {MarkUnread} from 'mattermost-redux/constants/channels';

import {hasNewPermissions} from 'mattermost-redux/selectors/entities/general';
import {haveITeamPermission, haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {Channel, ChannelMembership, ChannelType, ChannelNotifyProps} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';
import {UsersState, UserProfile, UserNotifyProps} from 'mattermost-redux/types/users';
import {GlobalState} from 'mattermost-redux/types/store';
import {TeamMembership} from 'mattermost-redux/types/teams';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import {Dictionary, IDMappedObjects, RelationOneToMany, RelationOneToOne} from 'mattermost-redux/types/utilities';

import {getPreferenceKey} from './preference_utils';
import {displayUsername} from './user_utils';

const channelTypeOrder = {
    [General.OPEN_CHANNEL]: 0,
    [General.PRIVATE_CHANNEL]: 1,
    [General.DM_CHANNEL]: 2,
    [General.GM_CHANNEL]: 3,
};

export function completeDirectChannelInfo(usersState: UsersState, teammateNameDisplay: string, channel: Channel): Channel {
    if (isDirectChannel(channel)) {
        const teammateId = getUserIdFromChannelName(usersState.currentUserId, channel.name);

        // return empty string instead of `someone` default string for display_name
        return {
            ...channel,
            display_name: displayUsername(usersState.profiles[teammateId], teammateNameDisplay, false),
            teammate_id: teammateId,
            status: usersState.statuses[teammateId] || 'offline',
        };
    } else if (isGroupChannel(channel)) {
        return completeDirectGroupInfo(usersState, teammateNameDisplay, channel);
    }

    return channel;
}

// newCompleteDirectChannelInfo is a variant of completeDirectChannelInfo that accepts the minimal
// data required instead of depending on the entirety of state.entities.users. This allows the
// calling selector to have fewer dependencies, reducing its need to recompute when memoized.
//
// Ideally, this would replace completeDirectChannelInfo altogether, but is currently factored out
// to minimize changes while addressing a critical performance issue.
export function newCompleteDirectChannelInfo(currentUserId: string, profiles: IDMappedObjects<UserProfile>, profilesInChannel: RelationOneToMany<Channel, UserProfile>, teammateStatus: string, teammateNameDisplay: string, channel: Channel): Channel {
    if (isDirectChannel(channel)) {
        const teammateId = getUserIdFromChannelName(currentUserId, channel.name);

        // return empty string instead of `someone` default string for display_name
        return {
            ...channel,
            display_name: displayUsername(profiles[teammateId], teammateNameDisplay, false),
            teammate_id: teammateId,
            status: teammateStatus,
        };
    } else if (isGroupChannel(channel)) {
        return newCompleteDirectGroupInfo(currentUserId, profiles, profilesInChannel, teammateNameDisplay, channel);
    }

    return channel;
}

export function completeDirectChannelDisplayName(currentUserId: string, profiles: IDMappedObjects<UserProfile>, userIdsInChannel: Set<string>, teammateNameDisplay: string, channel: Channel): Channel {
    if (isDirectChannel(channel)) {
        const dmChannelClone = {...channel};
        const teammateId = getUserIdFromChannelName(currentUserId, channel.name);

        return Object.assign(dmChannelClone, {display_name: displayUsername(profiles[teammateId], teammateNameDisplay)});
    } else if (isGroupChannel(channel) && userIdsInChannel && userIdsInChannel.size > 0) {
        const displayName = getGroupDisplayNameFromUserIds(Array.from(userIdsInChannel), profiles, currentUserId, teammateNameDisplay);
        return {...channel, display_name: displayName};
    }

    return channel;
}

export function cleanUpUrlable(input: string): string {
    let cleaned = input.trim().replace(/-/g, ' ').replace(/[^\w\s]/gi, '').toLowerCase().replace(/\s/g, '-');
    cleaned = cleaned.replace(/-{2,}/, '-');
    cleaned = cleaned.replace(/^-+/, '');
    cleaned = cleaned.replace(/-+$/, '');
    return cleaned;
}

export function getChannelByName(channels: IDMappedObjects<Channel>, name: string): Channel | undefined | null {
    const channelIds = Object.keys(channels);
    for (let i = 0; i < channelIds.length; i++) {
        const id = channelIds[i];
        if (channels[id].name === name) {
            return channels[id];
        }
    }
    return null;
}

export function getDirectChannelName(id: string, otherId: string): string {
    let handle;

    if (otherId > id) {
        handle = id + '__' + otherId;
    } else {
        handle = otherId + '__' + id;
    }

    return handle;
}

export function getUserIdFromChannelName(userId: string, channelName: string): string {
    const ids = channelName.split('__');
    let otherUserId = '';
    if (ids[0] === userId) {
        otherUserId = ids[1];
    } else {
        otherUserId = ids[0];
    }

    return otherUserId;
}

export function isAutoClosed(
    config: any,
    myPreferences: {
        [x: string]: PreferenceType;
    },
    channel: Channel,
    channelActivity: number,
    channelArchiveTime: number,
    currentChannelId = '',
    now = Date.now(),
): boolean {
    const cutoff = now - (7 * 24 * 60 * 60 * 1000);
    const viewTimePref = myPreferences[`${Preferences.CATEGORY_CHANNEL_APPROXIMATE_VIEW_TIME}--${channel.id}`];
    const viewTime = viewTimePref ? parseInt(viewTimePref.value!, 10) : 0;

    // Note that viewTime is not set correctly at the time of writing
    if (viewTime > cutoff) {
        return false;
    }

    const openTimePref = myPreferences[`${Preferences.CATEGORY_CHANNEL_OPEN_TIME}--${channel.id}`];
    const openTime = openTimePref ? parseInt(openTimePref.value!, 10) : 0;

    // Only close archived channels when not being viewed
    if (channel.id !== currentChannelId && channelArchiveTime && channelArchiveTime > openTime) {
        return true;
    }

    if (config.CloseUnusedDirectMessages !== 'true' || isFavoriteChannelOld(myPreferences, channel.id)) {
        return false;
    }

    const autoClose = myPreferences[getPreferenceKey(Preferences.CATEGORY_SIDEBAR_SETTINGS, Preferences.CHANNEL_SIDEBAR_AUTOCLOSE_DMS)];
    if (!autoClose || autoClose.value === Preferences.AUTOCLOSE_DMS_ENABLED) {
        if (channelActivity && channelActivity > cutoff) {
            return false;
        }
        if (openTime > cutoff) {
            return false;
        }
        const lastActivity = channel.last_post_at;
        return !lastActivity || lastActivity < cutoff;
    }

    return false;
}

export function isDirectChannel(channel: Channel): boolean {
    return channel.type === General.DM_CHANNEL;
}

export function isDirectChannelVisible(
    otherUserOrOtherUserId: UserProfile | string,
    config: any,
    myPreferences: {
        [x: string]: PreferenceType;
    },
    channel: Channel,
    lastPost?: Post | null,
    isUnread?: boolean,
    currentChannelId = '',
    now?: number,
): boolean {
    const otherUser = typeof otherUserOrOtherUserId === 'object' ? otherUserOrOtherUserId : null;
    const otherUserId = typeof otherUserOrOtherUserId === 'object' ? otherUserOrOtherUserId.id : otherUserOrOtherUserId;
    const dm = myPreferences[`${Preferences.CATEGORY_DIRECT_CHANNEL_SHOW}--${otherUserId}`];

    if (!dm || dm.value !== 'true') {
        return false;
    }

    return isUnread || !isAutoClosed(
        config,
        myPreferences,
        channel,
        lastPost ? lastPost.create_at : 0,
        otherUser ? otherUser.delete_at : 0,
        currentChannelId,
        now,
    );
}

export function isGroupChannel(channel: Channel): boolean {
    return channel.type === General.GM_CHANNEL;
}

export function isGroupChannelVisible(
    config: any,
    myPreferences: {
        [x: string]: PreferenceType;
    },
    channel: Channel,
    lastPost?: Post,
    isUnread?: boolean,
    now?: number,
): boolean {
    const gm = myPreferences[`${Preferences.CATEGORY_GROUP_CHANNEL_SHOW}--${channel.id}`];

    if (!gm || gm.value !== 'true') {
        return false;
    }

    return isUnread || !isAutoClosed(
        config,
        myPreferences,
        channel,
        lastPost ? lastPost.create_at : 0,
        0,
        '',
        now,
    );
}

export function isGroupOrDirectChannelVisible(
    channel: Channel,
    memberships: RelationOneToOne<Channel, ChannelMembership>,
    config: any,
    myPreferences: {
        [x: string]: PreferenceType;
    },
    currentUserId: string,
    users: IDMappedObjects<UserProfile>,
    lastPosts: RelationOneToOne<Channel, Post>,
    collapsedThreads: boolean,
    currentChannelId?: string,
    now?: number,
): boolean {
    const lastPost = lastPosts[channel.id];
    const unreadChannel = isUnreadChannel(memberships, channel, collapsedThreads);

    if (
        isGroupChannel(channel) &&
        isGroupChannelVisible(
            config,
            myPreferences,
            channel,
            lastPost,
            unreadChannel,
            now,
        )
    ) {
        return true;
    }

    if (!isDirectChannel(channel)) {
        return false;
    }

    const otherUserId = getUserIdFromChannelName(currentUserId, channel.name);

    return isDirectChannelVisible(
        users[otherUserId] || otherUserId,
        config,
        myPreferences,
        channel,
        lastPost,
        unreadChannel,
        currentChannelId,
        now,
    );
}

export function showCreateOption(state: GlobalState, config: any, license: any, teamId: string, channelType: ChannelType, isAdmin: boolean, isSystemAdmin: boolean): boolean {
    if (hasNewPermissions(state)) {
        if (channelType === General.OPEN_CHANNEL) {
            return haveITeamPermission(state, {team: teamId, permission: Permissions.CREATE_PUBLIC_CHANNEL});
        } else if (channelType === General.PRIVATE_CHANNEL) {
            return haveITeamPermission(state, {team: teamId, permission: Permissions.CREATE_PRIVATE_CHANNEL});
        }
        return true;
    }

    if (license.IsLicensed !== 'true') {
        return true;
    }

    // Backwards compatibility with pre-advanced permissions config settings.
    if (channelType === General.OPEN_CHANNEL) {
        if (config.RestrictPublicChannelCreation === General.SYSTEM_ADMIN_ROLE && !isSystemAdmin) {
            return false;
        } else if (config.RestrictPublicChannelCreation === General.TEAM_ADMIN_ROLE && !isAdmin) {
            return false;
        }
    } else if (channelType === General.PRIVATE_CHANNEL) {
        if (config.RestrictPrivateChannelCreation === General.SYSTEM_ADMIN_ROLE && !isSystemAdmin) {
            return false;
        } else if (config.RestrictPrivateChannelCreation === General.TEAM_ADMIN_ROLE && !isAdmin) {
            return false;
        }
    }

    return true;
}

export function showManagementOptions(state: GlobalState, config: any, license: any, channel: Channel, isAdmin: boolean, isSystemAdmin: boolean, isChannelAdmin: boolean): boolean {
    if (hasNewPermissions(state)) {
        if (channel.type === General.OPEN_CHANNEL) {
            return haveIChannelPermission(state, {channel: channel.id, team: channel.team_id, permission: Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES});
        } else if (channel.type === General.PRIVATE_CHANNEL) {
            return haveIChannelPermission(state, {channel: channel.id, team: channel.team_id, permission: Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES});
        }
        return true;
    }

    if (license.IsLicensed !== 'true') {
        return true;
    }

    // Backwards compatibility with pre-advanced permissions config settings.
    if (channel.type === General.OPEN_CHANNEL) {
        if (config.RestrictPublicChannelManagement === General.SYSTEM_ADMIN_ROLE && !isSystemAdmin) {
            return false;
        }
        if (config.RestrictPublicChannelManagement === General.TEAM_ADMIN_ROLE && !isAdmin) {
            return false;
        }
        if (config.RestrictPublicChannelManagement === General.CHANNEL_ADMIN_ROLE && !isChannelAdmin && !isAdmin) {
            return false;
        }
    } else if (channel.type === General.PRIVATE_CHANNEL) {
        if (config.RestrictPrivateChannelManagement === General.SYSTEM_ADMIN_ROLE && !isSystemAdmin) {
            return false;
        }
        if (config.RestrictPrivateChannelManagement === General.TEAM_ADMIN_ROLE && !isAdmin) {
            return false;
        }
        if (config.RestrictPrivateChannelManagement === General.CHANNEL_ADMIN_ROLE && !isChannelAdmin && !isAdmin) {
            return false;
        }
    }

    return true;
}

export function showDeleteOption(state: GlobalState, config: any, license: any, channel: Channel, isAdmin: boolean, isSystemAdmin: boolean, isChannelAdmin: boolean): boolean {
    if (hasNewPermissions(state)) {
        if (channel.type === General.OPEN_CHANNEL) {
            return haveIChannelPermission(state, {channel: channel.id, team: channel.team_id, permission: Permissions.DELETE_PUBLIC_CHANNEL});
        } else if (channel.type === General.PRIVATE_CHANNEL) {
            return haveIChannelPermission(state, {channel: channel.id, team: channel.team_id, permission: Permissions.DELETE_PRIVATE_CHANNEL});
        }
        return true;
    }

    if (license.IsLicensed !== 'true') {
        return true;
    }

    // Backwards compatibility with pre-advanced permissions config settings.
    if (channel.type === General.OPEN_CHANNEL) {
        if (config.RestrictPublicChannelDeletion === General.SYSTEM_ADMIN_ROLE && !isSystemAdmin) {
            return false;
        }
        if (config.RestrictPublicChannelDeletion === General.TEAM_ADMIN_ROLE && !isAdmin) {
            return false;
        }
        if (config.RestrictPublicChannelDeletion === General.CHANNEL_ADMIN_ROLE && !isChannelAdmin && !isAdmin) {
            return false;
        }
    } else if (channel.type === General.PRIVATE_CHANNEL) {
        if (config.RestrictPrivateChannelDeletion === General.SYSTEM_ADMIN_ROLE && !isSystemAdmin) {
            return false;
        }
        if (config.RestrictPrivateChannelDeletion === General.TEAM_ADMIN_ROLE && !isAdmin) {
            return false;
        }
        if (config.RestrictPrivateChannelDeletion === General.CHANNEL_ADMIN_ROLE && !isChannelAdmin && !isAdmin) {
            return false;
        }
    }

    return true;
}

// Backwards compatibility with pre-advanced permissions config settings.

export function canManageMembersOldPermissions(channel: Channel, user: UserProfile, teamMember: TeamMembership, channelMember: ChannelMembership, config: any, license: any): boolean {
    if (channel.type === General.DM_CHANNEL ||
        channel.type === General.GM_CHANNEL ||
        channel.name === General.DEFAULT_CHANNEL) {
        return false;
    }

    if (license.IsLicensed !== 'true') {
        return true;
    }

    if (channel.type === General.PRIVATE_CHANNEL) {
        const isSystemAdmin = user.roles.includes(General.SYSTEM_ADMIN_ROLE);
        if (config.RestrictPrivateChannelManageMembers === General.PERMISSIONS_SYSTEM_ADMIN && !isSystemAdmin) {
            return false;
        }

        const isTeamAdmin = teamMember.roles.includes(General.TEAM_ADMIN_ROLE);
        if (config.RestrictPrivateChannelManageMembers === General.PERMISSIONS_TEAM_ADMIN && !isTeamAdmin && !isSystemAdmin) {
            return false;
        }

        const isChannelAdmin = channelMember.roles.includes(General.CHANNEL_ADMIN_ROLE);
        if (config.RestrictPrivateChannelManageMembers === General.PERMISSIONS_CHANNEL_ADMIN && !isChannelAdmin && !isTeamAdmin && !isSystemAdmin) {
            return false;
        }
    }

    return true;
}

export function getChannelsIdForTeam(state: GlobalState, teamId: string): string[] {
    const {channels} = state.entities.channels;

    return Object.keys(channels).map((key) => channels[key]).reduce((res, channel: Channel) => {
        if (channel.team_id === teamId) {
            res.push(channel.id);
        }
        return res;
    }, [] as string[]);
}

export function getGroupDisplayNameFromUserIds(userIds: string[], profiles: IDMappedObjects<UserProfile>, currentUserId: string, teammateNameDisplay: string): string {
    const names: string[] = [];
    userIds.forEach((id) => {
        if (id !== currentUserId) {
            names.push(displayUsername(profiles[id], teammateNameDisplay));
        }
    });

    function sortUsernames(a: string, b: string) {
        const locale = getUserLocale(currentUserId, profiles);
        return a.localeCompare(b, locale, {numeric: true});
    }

    return names.sort(sortUsernames).join(', ');
}

export function isFavoriteChannelOld(myPreferences: {
    [x: string]: PreferenceType;
}, id: string) {
    const fav = myPreferences[`${Preferences.CATEGORY_FAVORITE_CHANNEL}--${id}`];
    return fav ? fav.value === 'true' : false;
}

export function isDefault(channel: Channel): boolean {
    return channel.name === General.DEFAULT_CHANNEL;
}

function completeDirectGroupInfo(usersState: UsersState, teammateNameDisplay: string, channel: Channel) {
    const {currentUserId, profiles, profilesInChannel} = usersState;
    const profilesIds = profilesInChannel[channel.id];
    const gm = {...channel};

    if (profilesIds) {
        gm.display_name = getGroupDisplayNameFromUserIds(profilesIds, profiles, currentUserId, teammateNameDisplay);
        return gm;
    }

    const usernames = gm.display_name.split(', ');
    const users = Object.keys(profiles).map((key) => profiles[key]);
    const userIds: string[] = [];
    usernames.forEach((username: string) => {
        const u = users.find((p): boolean => p.username === username);
        if (u) {
            userIds.push(u.id);
        }
    });
    if (usernames.length === userIds.length) {
        gm.display_name = getGroupDisplayNameFromUserIds(userIds, profiles, currentUserId, teammateNameDisplay);
        return gm;
    }

    return channel;
}

// newCompleteDirectGroupInfo is a variant of completeDirectGroupInfo that accepts the minimal
// data required instead of depending on the entirety of state.entities.users. This allows the
// calling selector to have fewer dependencies, reducing its need to recompute when memoized.
//
// See also newCompleteDirectChannelInfo.
function newCompleteDirectGroupInfo(currentUserId: string, profiles: IDMappedObjects<UserProfile>, profilesInChannel: RelationOneToMany<Channel, UserProfile>, teammateNameDisplay: string, channel: Channel) {
    const profilesIds = profilesInChannel[channel.id];
    const gm = {...channel};

    if (profilesIds) {
        gm.display_name = getGroupDisplayNameFromUserIds(profilesIds, profiles, currentUserId, teammateNameDisplay);
        return gm;
    }

    const usernames = gm.display_name.split(', ');
    const users = Object.keys(profiles).map((key) => profiles[key]);
    const userIds: string[] = [];
    usernames.forEach((username: string) => {
        const u = users.find((p): boolean => p.username === username);
        if (u) {
            userIds.push(u.id);
        }
    });
    if (usernames.length === userIds.length) {
        gm.display_name = getGroupDisplayNameFromUserIds(userIds, profiles, currentUserId, teammateNameDisplay);
        return gm;
    }

    return channel;
}

export function isUnreadChannel(members: RelationOneToOne<Channel, ChannelMembership>, channel: Channel, collapsedThreads: boolean): boolean {
    const member = members[channel.id];
    if (member) {
        const unreadMessageCount = getMsgCountInChannel(collapsedThreads, channel, member);
        const onlyMentions = member.notify_props && member.notify_props.mark_unread === MarkUnread.MENTION;
        return (
            (collapsedThreads ? member.mention_count_root : member.mention_count) > 0 ||
            (Boolean(unreadMessageCount) && !onlyMentions)
        );
    }

    return false;
}

export function isOpenChannel(channel: Channel): boolean {
    return channel.type === General.OPEN_CHANNEL;
}

export function isPrivateChannel(channel: Channel): boolean {
    return channel.type === General.PRIVATE_CHANNEL;
}

export function sortChannelsByTypeListAndDisplayName(locale: string, typeList: string[], a: Channel, b: Channel): number {
    const idxA = typeList.indexOf(a.type);
    const idxB = typeList.indexOf(b.type);

    if (idxA === -1 && idxB !== -1) {
        return 1;
    }
    if (idxB === -1 && idxA !== -1) {
        return -1;
    }

    if (idxA !== idxB) {
        if (idxA < idxB) {
            return -1;
        }
        return 1;
    }

    const aDisplayName = filterName(a.display_name);
    const bDisplayName = filterName(b.display_name);

    if (aDisplayName !== bDisplayName) {
        return aDisplayName.toLowerCase().localeCompare(bDisplayName.toLowerCase(), locale, {numeric: true});
    }

    return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), locale, {numeric: true});
}

export function sortChannelsByTypeAndDisplayName(locale: string, a: Channel, b: Channel): number {
    if (channelTypeOrder[a.type] !== channelTypeOrder[b.type]) {
        if (channelTypeOrder[a.type] < channelTypeOrder[b.type]) {
            return -1;
        }

        return 1;
    }

    const aDisplayName = filterName(a.display_name);
    const bDisplayName = filterName(b.display_name);

    if (aDisplayName !== bDisplayName) {
        return aDisplayName.toLowerCase().localeCompare(bDisplayName.toLowerCase(), locale, {numeric: true});
    }

    return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), locale, {numeric: true});
}

function filterName(name: string): string {
    return name.replace(/[.,'"\/#!$%\^&\*;:{}=\-_`~()]/g, ''); // eslint-disable-line no-useless-escape
}

export function sortChannelsByDisplayName(locale: string, a: Channel, b: Channel): number {
    // if both channels have the display_name defined
    if (a.display_name && b.display_name && a.display_name !== b.display_name) {
        return a.display_name.toLowerCase().localeCompare(b.display_name.toLowerCase(), locale, {numeric: true});
    }

    return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), locale, {numeric: true});
}

export function sortChannelsByDisplayNameAndMuted(locale: string, members: RelationOneToOne<Channel, ChannelMembership>, a: Channel, b: Channel): number {
    const aMember = members[a.id];
    const bMember = members[b.id];

    if (isChannelMuted(bMember) === isChannelMuted(aMember)) {
        return sortChannelsByDisplayName(locale, a, b);
    }

    if (!isChannelMuted(bMember) && isChannelMuted(aMember)) {
        return 1;
    }

    return -1;
}

export function sortChannelsByRecency(lastPosts: RelationOneToOne<Channel, Post>, a: Channel, b: Channel): number {
    let aLastPostAt = a.last_post_at;
    if (lastPosts[a.id] && lastPosts[a.id].create_at > a.last_post_at) {
        aLastPostAt = lastPosts[a.id].create_at;
    }

    let bLastPostAt = b.last_post_at;
    if (lastPosts[b.id] && lastPosts[b.id].create_at > b.last_post_at) {
        bLastPostAt = lastPosts[b.id].create_at;
    }

    return bLastPostAt - aLastPostAt;
}

export function isChannelMuted(member?: ChannelMembership): boolean {
    return member?.notify_props ? (member.notify_props.mark_unread === MarkUnread.MENTION) : false;
}

export function areChannelMentionsIgnored(channelMemberNotifyProps: ChannelNotifyProps, currentUserNotifyProps: UserNotifyProps) {
    let ignoreChannelMentionsDefault = Users.IGNORE_CHANNEL_MENTIONS_OFF;

    if (currentUserNotifyProps.channel && currentUserNotifyProps.channel === 'false') {
        ignoreChannelMentionsDefault = Users.IGNORE_CHANNEL_MENTIONS_ON;
    }

    let ignoreChannelMentions = channelMemberNotifyProps && channelMemberNotifyProps.ignore_channel_mentions;
    if (!ignoreChannelMentions || ignoreChannelMentions === Users.IGNORE_CHANNEL_MENTIONS_DEFAULT) {
        ignoreChannelMentions = ignoreChannelMentionsDefault as any;
    }

    return ignoreChannelMentions !== Users.IGNORE_CHANNEL_MENTIONS_OFF;
}

function getUserLocale(userId: string, profiles: IDMappedObjects<UserProfile>) {
    let locale = General.DEFAULT_LOCALE;
    if (profiles && profiles[userId] && profiles[userId].locale) {
        locale = profiles[userId].locale;
    }

    return locale;
}

export function filterChannelsMatchingTerm(channels: Channel[], term: string): Channel[] {
    const lowercasedTerm = term.toLowerCase();

    return channels.filter((channel: Channel): boolean => {
        if (!channel) {
            return false;
        }
        const name = (channel.name || '').toLowerCase();
        const displayName = (channel.display_name || '').toLowerCase();

        return name.startsWith(lowercasedTerm) ||
            displayName.startsWith(lowercasedTerm);
    });
}

export function channelListToMap(channelList: Channel[]): IDMappedObjects<Channel> {
    const channels: Dictionary<Channel> = {};
    for (let i = 0; i < channelList.length; i++) {
        channels[channelList[i].id] = channelList[i];
    }
    return channels;
}

export function getMsgCountInChannel(collapsed: boolean, channel: Channel, member: ChannelMembership): number {
    return collapsed ? Math.max(channel.total_msg_count_root - member.msg_count_root, 0) : Math.max(channel.total_msg_count - member.msg_count, 0);
}
