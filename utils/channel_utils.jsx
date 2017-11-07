
// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import ChannelStore from 'stores/channel_store.jsx';
import LocalizationStore from 'stores/localization_store.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

const Preferences = Constants.Preferences;

export function isFavoriteChannel(channel) {
    return PreferenceStore.getBool(Preferences.CATEGORY_FAVORITE_CHANNEL, channel.id);
}

export function isFavoriteChannelId(channelId) {
    return PreferenceStore.getBool(Preferences.CATEGORY_FAVORITE_CHANNEL, channelId);
}

export function isNotDeletedChannel(channel) {
    return channel.delete_at === 0;
}

export function isOpenChannel(channel) {
    return channel.type === Constants.OPEN_CHANNEL;
}

export function isPrivateChannel(channel) {
    return channel.type === Constants.PRIVATE_CHANNEL;
}

export function isGroupChannel(channel) {
    return channel.type === Constants.GM_CHANNEL;
}

export function isDirectChannel(channel) {
    return channel.type === Constants.DM_CHANNEL;
}

export function completeDirectChannelInfo(channel) {
    if (!isDirectChannel(channel)) {
        return channel;
    }

    const dmChannelClone = JSON.parse(JSON.stringify(channel));
    const teammateId = Utils.getUserIdFromChannelName(channel);

    return Object.assign(dmChannelClone, {
        display_name: Utils.displayUsername(teammateId),
        teammate_id: teammateId,
        status: UserStore.getStatus(teammateId) || 'offline'
    });
}

const defaultPrefix = 'D'; // fallback for future types
const typeToPrefixMap = {[Constants.OPEN_CHANNEL]: 'A', [Constants.PRIVATE_CHANNEL]: 'B', [Constants.DM_CHANNEL]: 'C', [Constants.GM_CHANNEL]: 'C'};

export function sortChannelsByDisplayName(a, b) {
    const locale = LocalizationStore.getLocale();

    if (a.type !== b.type && typeToPrefixMap[a.type] !== typeToPrefixMap[b.type]) {
        return (typeToPrefixMap[a.type] || defaultPrefix).localeCompare((typeToPrefixMap[b.type] || defaultPrefix), locale);
    }

    const aDisplayName = getChannelDisplayName(a);
    const bDisplayName = getChannelDisplayName(b);

    if (aDisplayName !== null && bDisplayName !== null && aDisplayName !== bDisplayName) {
        return aDisplayName.localeCompare(bDisplayName, locale, {numeric: true});
    }

    return a.name.localeCompare(b.name, locale, {numeric: true});
}

const MAX_CHANNEL_NAME_LENGTH = 64;

export function getChannelDisplayName(channel) {
    if (channel.type !== Constants.GM_CHANNEL) {
        return channel.display_name;
    }

    const currentUser = UserStore.getCurrentUser();

    if (currentUser) {
        let displayName = channel.display_name;
        if (displayName.length >= MAX_CHANNEL_NAME_LENGTH) {
            displayName += '...';
        }
        displayName = displayName.replace(currentUser.username + ', ', '').replace(currentUser.username, '').trim();
        if (displayName[displayName.length - 1] === ',') {
            return displayName.slice(0, -1);
        }
        return displayName;
    }

    return channel.display_name;
}

export function showCreateOption(channelType, isTeamAdmin, isSystemAdmin) {
    if (global.window.mm_license.IsLicensed !== 'true') {
        return true;
    }

    if (channelType === Constants.OPEN_CHANNEL) {
        if (global.window.mm_config.RestrictPublicChannelCreation === Constants.PERMISSIONS_SYSTEM_ADMIN && !isSystemAdmin) {
            return false;
        } else if (global.window.mm_config.RestrictPublicChannelCreation === Constants.PERMISSIONS_TEAM_ADMIN && !(isTeamAdmin || isSystemAdmin)) {
            return false;
        }
    } else if (channelType === Constants.PRIVATE_CHANNEL) {
        if (global.window.mm_config.RestrictPrivateChannelCreation === Constants.PERMISSIONS_SYSTEM_ADMIN && !isSystemAdmin) {
            return false;
        } else if (global.window.mm_config.RestrictPrivateChannelCreation === Constants.PERMISSIONS_TEAM_ADMIN && !(isTeamAdmin || isSystemAdmin)) {
            return false;
        }
    }

    return true;
}

export function showManagementOptions(channel, isChannelAdmin, isTeamAdmin, isSystemAdmin) {
    if (global.window.mm_license.IsLicensed !== 'true') {
        // policies are only enforced in enterprise editions
        return true;
    }

    if (channel.type === Constants.OPEN_CHANNEL) {
        if (global.window.mm_config.RestrictPublicChannelManagement === Constants.PERMISSIONS_CHANNEL_ADMIN && !(isChannelAdmin || isTeamAdmin || isSystemAdmin)) {
            return false;
        }
        if (global.window.mm_config.RestrictPublicChannelManagement === Constants.PERMISSIONS_TEAM_ADMIN && !(isTeamAdmin || isSystemAdmin)) {
            return false;
        }
        if (global.window.mm_config.RestrictPublicChannelManagement === Constants.PERMISSIONS_SYSTEM_ADMIN && !isSystemAdmin) {
            return false;
        }
    } else if (channel.type === Constants.PRIVATE_CHANNEL) {
        if (global.window.mm_config.RestrictPrivateChannelManagement === Constants.PERMISSIONS_CHANNEL_ADMIN && !(isChannelAdmin || isTeamAdmin || isSystemAdmin)) {
            return false;
        }
        if (global.window.mm_config.RestrictPrivateChannelManagement === Constants.PERMISSIONS_TEAM_ADMIN && !(isTeamAdmin || isSystemAdmin)) {
            return false;
        }
        if (global.window.mm_config.RestrictPrivateChannelManagement === Constants.PERMISSIONS_SYSTEM_ADMIN && !isSystemAdmin) {
            return false;
        }
    }

    return true;
}

export function showDeleteOptionForCurrentUser(channel, isChannelAdmin, isTeamAdmin, isSystemAdmin) {
    if (global.window.mm_license.IsLicensed !== 'true') {
        // policies are only enforced in enterprise editions
        return true;
    }

    if (ChannelStore.isDefault(channel)) {
        // can't delete default channels, no matter who you are
        return false;
    }

    if (channel.type === Constants.OPEN_CHANNEL) {
        if (global.window.mm_config.RestrictPublicChannelDeletion === Constants.PERMISSIONS_CHANNEL_ADMIN && !(isChannelAdmin || isTeamAdmin || isSystemAdmin)) {
            return false;
        }
        if (global.window.mm_config.RestrictPublicChannelDeletion === Constants.PERMISSIONS_TEAM_ADMIN && !(isTeamAdmin || isSystemAdmin)) {
            return false;
        }
        if (global.window.mm_config.RestrictPublicChannelDeletion === Constants.PERMISSIONS_SYSTEM_ADMIN && !isSystemAdmin) {
            return false;
        }
    } else if (channel.type === Constants.PRIVATE_CHANNEL) {
        if (global.window.mm_config.RestrictPrivateChannelDeletion === Constants.PERMISSIONS_CHANNEL_ADMIN && !(isChannelAdmin || isTeamAdmin || isSystemAdmin)) {
            return false;
        }
        if (global.window.mm_config.RestrictPrivateChannelDeletion === Constants.PERMISSIONS_TEAM_ADMIN && !(isTeamAdmin || isSystemAdmin)) {
            return false;
        }
        if (global.window.mm_config.RestrictPrivateChannelDeletion === Constants.PERMISSIONS_SYSTEM_ADMIN && !isSystemAdmin) {
            return false;
        }
    }

    return true;
}

export function canManageMembers(channel, isChannelAdmin, isTeamAdmin, isSystemAdmin) {
    if (global.window.mm_license.IsLicensed !== 'true') {
        return true;
    }

    if (channel.type === Constants.PRIVATE_CHANNEL) {
        if (global.window.mm_config.RestrictPrivateChannelManageMembers === Constants.PERMISSIONS_CHANNEL_ADMIN && !(isChannelAdmin || isTeamAdmin || isSystemAdmin)) {
            return false;
        }
        if (global.window.mm_config.RestrictPrivateChannelManageMembers === Constants.PERMISSIONS_TEAM_ADMIN && !(isTeamAdmin || isSystemAdmin)) {
            return false;
        }
        if (global.window.mm_config.RestrictPrivateChannelManageMembers === Constants.PERMISSIONS_SYSTEM_ADMIN && !isSystemAdmin) {
            return false;
        }
    }

    return true;
}

export function getCountsStateFromStores(team = TeamStore.getCurrent(), teamMembers = TeamStore.getMyTeamMembers(), unreadCounts = ChannelStore.getUnreadCounts()) {
    let mentionCount = 0;
    let messageCount = 0;

    teamMembers.forEach((member) => {
        if (member.team_id !== TeamStore.getCurrentId()) {
            mentionCount += (member.mention_count || 0);
            messageCount += (member.msg_count || 0);
        }
    });

    Object.keys(unreadCounts).forEach((chId) => {
        const channel = ChannelStore.get(chId);

        if (channel && (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL || channel.team_id === team.id)) {
            messageCount += unreadCounts[chId].msgs;
            mentionCount += unreadCounts[chId].mentions;
        }
    });

    return {mentionCount, messageCount};
}
