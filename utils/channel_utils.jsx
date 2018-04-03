// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import Permissions from 'mattermost-redux/constants/permissions';
import * as ChannelUtilsRedux from 'mattermost-redux/utils/channel_utils';

import ChannelStore from 'stores/channel_store.jsx';
import LocalizationStore from 'stores/localization_store.jsx';
import PreferenceStore from 'stores/preference_store.jsx';
import store from 'stores/redux_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import Constants, {Preferences} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

export function isFavoriteChannel(channel) {
    return PreferenceStore.getBool(Preferences.CATEGORY_FAVORITE_CHANNEL, channel.id);
}

export function isFavoriteChannelId(channelId) {
    return PreferenceStore.getBool(Preferences.CATEGORY_FAVORITE_CHANNEL, channelId);
}

export function sortChannelsByDisplayName(a, b) {
    const locale = LocalizationStore.getLocale();

    return ChannelUtilsRedux.sortChannelsByTypeAndDisplayName(locale, a, b);
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

export function canManageMembers(channel) {
    if (channel.type === Constants.PRIVATE_CHANNEL) {
        return haveIChannelPermission(
            store.getState(),
            {
                channel: channel.id,
                team: channel.team_id,
                permission: Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS,
            }
        );
    }

    if (channel.type === Constants.OPEN_CHANNEL) {
        return haveIChannelPermission(
            store.getState(),
            {
                channel: channel.id,
                team: channel.team_id,
                permission: Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS,
            }
        );
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

export function findNextUnreadChannelId(curChannelId, allChannelIds, unreadChannelIds, direction) {
    const curIndex = allChannelIds.indexOf(curChannelId);

    for (let i = 1; i < allChannelIds.length; i++) {
        const index = Utils.mod(curIndex + (i * direction), allChannelIds.length);

        if (unreadChannelIds.includes(allChannelIds[index])) {
            return index;
        }
    }

    return -1;
}
