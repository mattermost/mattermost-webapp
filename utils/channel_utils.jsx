// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getRedirectChannelNameForTeam as getRedirectChannelNameForTeamRedux} from 'mattermost-redux/selectors/entities/channels';
import Permissions from 'mattermost-redux/constants/permissions';

import store from 'stores/redux_store.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

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

export function getRedirectChannelNameForTeam(teamId) {
    return getRedirectChannelNameForTeamRedux(store.getState(), teamId);
}
