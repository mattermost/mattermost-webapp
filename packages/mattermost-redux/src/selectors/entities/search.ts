// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserMentionKeys, UserMentionKey} from 'mattermost-redux/selectors/entities/users';
import {getMyGroupMentionKeys} from 'mattermost-redux/selectors/entities/groups';

import {GlobalState} from '@mattermost/types/store';
import {SearchParams} from '@mattermost/types/search';

export const getCurrentSearchForCurrentTeam: (state: GlobalState) => string = createSelector(
    'getCurrentSearchForCurrentTeam',
    (state: GlobalState) => state.entities.search.current,
    getCurrentTeamId,
    (current, teamId) => {
        return current[teamId];
    },
);

export const getAllUserMentionKeys: (state: GlobalState) => UserMentionKey[] = createSelector(
    'getAllUserMentionKeys',
    getCurrentUserMentionKeys,
    getMyGroupMentionKeys,
    (userMentionKeys, groupMentionKeys) => {
        return userMentionKeys.concat(groupMentionKeys);
    },
);

export function recentSearches(state: GlobalState): SearchParams[] {
    const recentSearches = state.entities.search.recentSearches;
    const channels = state.entities.channels.channels;
    const userProfiles = state.entities.users.profiles;
    if (!recentSearches) {
        return [];
    }
    return recentSearches.map((searchParams) =>
        ({
            ...searchParams,
            in_channels: searchParams?.in_channels?.
                map((channelId) => channels[channelId as unknown as string] || null).
                filter((e) => e !== null),
            excluded_channels: searchParams?.excluded_channels?.
                map((channelId) => channels[channelId as unknown as string] || null).
                filter((e) => e !== null),
            from_users: searchParams?.from_users?.
                map((userId) => userProfiles[userId as unknown as string] || null).
                filter((e) => e !== null),
            excluded_users: searchParams?.excluded_users?.
                map((userId) => userProfiles[userId as unknown as string] || null).
                filter((e) => e !== null),
        }));
}
