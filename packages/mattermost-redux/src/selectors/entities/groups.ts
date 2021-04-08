// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {createSelector} from 'reselect';

import {Group} from 'mattermost-redux/types/groups';
import {filterGroupsMatchingTerm} from 'mattermost-redux/utils/group_utils';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';
import {UserMentionKey} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'mattermost-redux/types/store';

import {Dictionary, NameMappedObjects} from 'mattermost-redux/types/utilities';

const emptyList: any[] = [];
const emptySyncables = {
    teams: [],
    channels: [],
};

export function getAllGroups(state: GlobalState) {
    return state.entities.groups.groups;
}

export function getMyGroups(state: GlobalState) {
    return state.entities.groups.myGroups;
}

export function getAllGroupStats(state: GlobalState) {
    return state.entities.groups.stats;
}

export function getGroupStats(state: GlobalState, id: string) {
    return getAllGroupStats(state)[id] || {};
}

export function getGroup(state: GlobalState, id: string) {
    return getAllGroups(state)[id];
}

export function getGroupMemberCount(state: GlobalState, id: string) {
    return getGroupStats(state, id).total_member_count;
}

function getGroupSyncables(state: GlobalState, id: string) {
    return state.entities.groups.syncables[id] || emptySyncables;
}

export function getGroupTeams(state: GlobalState, id: string) {
    return getGroupSyncables(state, id).teams;
}

export function getGroupChannels(state: GlobalState, id: string) {
    return getGroupSyncables(state, id).channels;
}

export const getAssociatedGroupsByName: (state: GlobalState, teamID: string, channelId: string) => NameMappedObjects<Group> = createSelector(
    getAssociatedGroupsForReference,
    (groups) => {
        const groupsByName: Dictionary<Group> = {};

        for (const id in groups) {
            if (groups.hasOwnProperty(id)) {
                const group = groups[id];
                groupsByName[group.name] = group;
            }
        }

        return groupsByName;
    },
);

export const getAssociatedGroupsForReferenceByMention: (state: GlobalState, teamID: string, channelId: string) => Map<string, Group> = createSelector(
    getAssociatedGroupsForReference,
    (groups) => {
        return new Map(groups.map((group) => [`@${group.name}`, group]));
    },
);

export function searchAssociatedGroupsForReferenceLocal(state: GlobalState, term: string, teamId: string, channelId: string): Group[] {
    const groups = getAssociatedGroupsForReference(state, teamId, channelId);
    if (!groups) {
        return emptyList;
    }
    const filteredGroups = filterGroupsMatchingTerm(groups, term);
    return filteredGroups;
}

export function getAssociatedGroupsForReference(state: GlobalState, teamId: string, channelId: string): Group[] {
    const team = getTeam(state, teamId);
    const channel = getChannel(state, channelId);

    let groupsForReference = [];
    if (team && team.group_constrained && channel && channel.group_constrained) {
        const groupsFromChannel = getGroupsAssociatedToChannelForReference(state, channelId);
        const groupsFromTeam = getGroupsAssociatedToTeamForReference(state, teamId);
        groupsForReference = groupsFromChannel.concat(groupsFromTeam.filter((item) => groupsFromChannel.indexOf(item) < 0));
    } else if (team && team.group_constrained) {
        groupsForReference = getGroupsAssociatedToTeamForReference(state, teamId);
    } else if (channel && channel.group_constrained) {
        groupsForReference = getGroupsAssociatedToChannelForReference(state, channelId);
    } else {
        groupsForReference = getAllAssociatedGroupsForReference(state);
    }
    return groupsForReference;
}

const teamGroupIDs = (state: GlobalState, teamID: string) => state.entities.teams.groupsAssociatedToTeam[teamID]?.ids || [];

const channelGroupIDs = (state: GlobalState, channelID: string) => state.entities.channels.groupsAssociatedToChannel[channelID]?.ids || [];

const getTeamGroupIDSet = createSelector(
    teamGroupIDs,
    (teamIDs) => new Set(teamIDs),
);

const getChannelGroupIDSet = createSelector(
    channelGroupIDs,
    (channelIDs) => new Set(channelIDs),
);

export const getGroupsNotAssociatedToTeam: (state: GlobalState, teamID: string) => Group[] = createSelector(
    getAllGroups,
    (state: GlobalState, teamID: string) => getTeamGroupIDSet(state, teamID),
    (allGroups, teamGroupIDSet) => {
        return Object.entries(allGroups).filter(([groupID]) => !teamGroupIDSet.has(groupID)).map((entry) => entry[1]);
    },
);

export const getGroupsAssociatedToTeam: (state: GlobalState, teamID: string) => Group[] = createSelector(
    getAllGroups,
    (state: GlobalState, teamID: string) => getTeamGroupIDSet(state, teamID),
    (allGroups, teamGroupIDSet) => {
        return Object.entries(allGroups).filter(([groupID]) => teamGroupIDSet.has(groupID)).map((entry) => entry[1]);
    },
);

export const getGroupsNotAssociatedToChannel: (state: GlobalState, channelID: string, teamID: string) => Group[] = createSelector(
    getAllGroups,
    (state: GlobalState, channelID: string) => getChannelGroupIDSet(state, channelID),
    (state: GlobalState, channelID: string, teamID: string) => getTeam(state, teamID),
    (state: GlobalState, channelID: string, teamID: string) => getGroupsAssociatedToTeam(state, teamID),
    (allGroups, channelGroupIDSet, team, teamGroups) => {
        let result = Object.values(allGroups).filter((group) => !channelGroupIDSet.has(group.id));
        if (team.group_constrained) {
            const gids = teamGroups.map((group) => group.id);
            result = result.filter((group) => gids?.includes(group.id));
        }
        return result;
    },
);

export const getGroupsAssociatedToChannel: (state: GlobalState, channelID: string) => Group[] = createSelector(
    getAllGroups,
    (state: GlobalState, channelID: string) => getChannelGroupIDSet(state, channelID),
    (allGroups, channelGroupIDSet) => {
        return Object.entries(allGroups).filter(([groupID]) => channelGroupIDSet.has(groupID)).map((entry) => entry[1]);
    },
);

export const getGroupsAssociatedToTeamForReference: (state: GlobalState, teamID: string) => Group[] = createSelector(
    getAllGroups,
    (state: GlobalState, teamID: string) => getTeamGroupIDSet(state, teamID),
    (allGroups, teamGroupIDSet) => {
        return Object.entries(allGroups).filter(([groupID]) => teamGroupIDSet.has(groupID)).filter((entry) => (entry[1].allow_reference && entry[1].delete_at === 0)).map((entry) => entry[1]);
    },
);

export const getGroupsAssociatedToChannelForReference: (state: GlobalState, channelID: string) => Group[] = createSelector(
    getAllGroups,
    (state: GlobalState, channelID: string) => getChannelGroupIDSet(state, channelID),
    (allGroups, channelGroupIDSet) => {
        return Object.entries(allGroups).filter(([groupID]) => channelGroupIDSet.has(groupID)).filter((entry) => (entry[1].allow_reference && entry[1].delete_at === 0)).map((entry) => entry[1]);
    },
);

export const getAllAssociatedGroupsForReference: (state: GlobalState) => Group[] = createSelector(
    getAllGroups,
    (allGroups) => {
        return Object.entries(allGroups).filter((entry) => (entry[1].allow_reference && entry[1].delete_at === 0)).map((entry) => entry[1]);
    },
);

export const getAllGroupsForReferenceByName: (state: GlobalState) => NameMappedObjects<Group> = createSelector(
    getAllAssociatedGroupsForReference,
    (groups) => {
        const groupsByName: Dictionary<Group> = {};

        for (const id in groups) {
            if (groups.hasOwnProperty(id)) {
                const group = groups[id];
                groupsByName[group.name] = group;
            }
        }

        return groupsByName;
    },
);

export const getMyAllowReferencedGroups: (state: GlobalState) => Group[] = createSelector(
    getMyGroups,
    (myGroups) => {
        return Object.values(myGroups).filter((group) => group.allow_reference && group.delete_at === 0);
    },
);

export const getMyGroupsAssociatedToChannelForReference: (state: GlobalState, teamId: string, channelId: string) => Group[] = createSelector(
    getMyGroups,
    getAssociatedGroupsByName,
    (myGroups, groups) => {
        return Object.values(myGroups).filter((group) => group.allow_reference && group.delete_at === 0 && groups[group.name]);
    },
);

export const getMyGroupMentionKeys: (state: GlobalState) => UserMentionKey[] = createSelector(
    getMyAllowReferencedGroups,
    (groups: Group[]) => {
        const keys: UserMentionKey[] = [];
        groups.forEach((group) => keys.push({key: `@${group.name}`}));
        return keys;
    },
);

export const getMyGroupMentionKeysForChannel: (state: GlobalState, teamId: string, channelId: string) => UserMentionKey[] = createSelector(
    getMyGroupsAssociatedToChannelForReference,
    (groups: Group[]) => {
        const keys: UserMentionKey[] = [];
        groups.forEach((group) => keys.push({key: `@${group.name}`}));
        return keys;
    },
);
