// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {ChannelMembership, Channel} from 'mattermost-redux/types/channels';
import {TeamMembership} from 'mattermost-redux/types/teams';
import {GlobalState} from 'mattermost-redux/types/store';
import {UserProfile} from 'mattermost-redux/types/users';
import {ThreadsState} from 'mattermost-redux/types/threads';
import {RelationOneToOne, IDMappedObjects, UserIDMappedObjects} from 'mattermost-redux/types/utilities';

// Channels

export function getCurrentChannelId(state: GlobalState): string {
    return state.entities.channels.currentChannelId;
}

export function getMyChannelMemberships(state: GlobalState): RelationOneToOne<Channel, ChannelMembership> {
    return state.entities.channels.myMembers;
}

export const getMyCurrentChannelMembership: (a: GlobalState) => ChannelMembership | undefined = createSelector(
    'getMyCurrentChannelMembership',
    getCurrentChannelId,
    getMyChannelMemberships,
    (currentChannelId, channelMemberships) => {
        return channelMemberships[currentChannelId];
    },
);

export function getMembersInChannel(state: GlobalState, channelId: string): UserIDMappedObjects<ChannelMembership> {
    return state.entities.channels?.membersInChannel?.[channelId] || {};
}

// Teams

export function getMembersInTeam(state: GlobalState, teamId: string): RelationOneToOne<UserProfile, TeamMembership> {
    return state.entities.teams?.membersInTeam?.[teamId] || {};
}

// Users

export function getCurrentUser(state: GlobalState): UserProfile {
    return state.entities.users.profiles[getCurrentUserId(state)];
}

export function getCurrentUserId(state: GlobalState): string {
    return state.entities.users.currentUserId;
}

export function getUsers(state: GlobalState): IDMappedObjects<UserProfile> {
    return state.entities.users.profiles;
}

export function getThreadCounts(state: GlobalState): ThreadsState['counts'] {
    return state.entities.threads.counts;
}

export function getThreadCountsIncludingDirect(state: GlobalState): ThreadsState['counts'] {
    return state.entities.threads.countsIncludingDirect;
}

