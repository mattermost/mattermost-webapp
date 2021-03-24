// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {Permissions} from 'mattermost-redux/constants';

import {getConfig, getCurrentUrl, isCompatibleWithJoinViewTeamPermissions} from 'mattermost-redux/selectors/entities/general';
import {haveISystemPermission} from 'mattermost-redux/selectors/entities/roles_helpers';

import {GlobalState} from 'mattermost-redux/types/store';
import {Team, TeamMembership, TeamStats} from 'mattermost-redux/types/teams';
import {UserProfile} from 'mattermost-redux/types/users';
import {$ID, IDMappedObjects, RelationOneToOne} from 'mattermost-redux/types/utilities';

import {createIdsSelector} from 'mattermost-redux/utils/helpers';
import {isTeamAdmin} from 'mattermost-redux/utils/user_utils';
import {sortTeamsWithLocale} from 'mattermost-redux/utils/team_utils';

export function getCurrentTeamId(state: GlobalState) {
    return state.entities.teams.currentTeamId;
}

export function getTeamByName(state: GlobalState, name: string) {
    const teams = getTeams(state);

    return Object.values(teams).find((team) => team.name === name);
}

export function getTeams(state: GlobalState): IDMappedObjects<Team> {
    return state.entities.teams.teams;
}

export function getTeamsInPolicy(state: GlobalState): IDMappedObjects<Team> {
    return state.entities.teams.teamsInPolicy;
}

export function getTeamStats(state: GlobalState) {
    return state.entities.teams.stats;
}

export function getTeamMemberships(state: GlobalState) {
    return state.entities.teams.myMembers;
}

export function getMembersInTeams(state: GlobalState) {
    return state.entities.teams.membersInTeam;
}

export const getTeamsList: (state: GlobalState) => Team[] = createSelector(
    getTeams,
    (teams) => {
        return Object.values(teams);
    },
);

export const getCurrentTeam: (state: GlobalState) => Team = createSelector(
    getTeams,
    getCurrentTeamId,
    (teams, currentTeamId) => {
        return teams[currentTeamId];
    },
);

export function getTeam(state: GlobalState, id: string): Team {
    const teams = getTeams(state);
    return teams[id];
}

export const getCurrentTeamMembership: (state: GlobalState) => TeamMembership = createSelector(
    getCurrentTeamId,
    getTeamMemberships,
    (currentTeamId: string, teamMemberships: {[teamId: string]: TeamMembership}): TeamMembership => {
        return teamMemberships[currentTeamId];
    },
);

export const isCurrentUserCurrentTeamAdmin: (state: GlobalState) => boolean = createSelector(
    getCurrentTeamMembership,
    (member) => {
        if (member) {
            const roles = member.roles || '';
            return isTeamAdmin(roles);
        }
        return false;
    },
);

export const getCurrentTeamUrl: (state: GlobalState) => string = createSelector(
    getCurrentUrl,
    getCurrentTeam,
    (state) => getConfig(state).SiteURL,
    (currentURL, currentTeam, siteURL) => {
        const rootURL = `${currentURL || siteURL}`;
        if (!currentTeam) {
            return rootURL;
        }

        return `${rootURL}/${currentTeam.name}`;
    },
);

export const getCurrentRelativeTeamUrl: (state: GlobalState) => string = createSelector(
    getCurrentTeam,
    (currentTeam) => {
        if (!currentTeam) {
            return '/';
        }
        return `/${currentTeam.name}`;
    },
);

export const getCurrentTeamStats: (state: GlobalState) => TeamStats = createSelector(
    getCurrentTeamId,
    getTeamStats,
    (currentTeamId, teamStats) => {
        return teamStats[currentTeamId];
    },
);

export const getMyTeams: (state: GlobalState) => Team[] = createSelector(
    getTeams,
    getTeamMemberships,
    (teams, members) => {
        return Object.values(teams).filter((t) => members[t.id] && t.delete_at === 0);
    },
);

export const getMyTeamMember: (state: GlobalState, teamId: string) => TeamMembership = createSelector(
    getTeamMemberships,
    (state: GlobalState, teamId: string) => teamId,
    (teamMemberships, teamId) => {
        return teamMemberships[teamId] || {};
    },
);

export const getMembersInCurrentTeam: (state: GlobalState) => RelationOneToOne<UserProfile, TeamMembership> = createSelector(
    getCurrentTeamId,
    getMembersInTeams,
    (currentTeamId, teamMembers) => {
        return teamMembers[currentTeamId];
    },
);

export function getTeamMember(state: GlobalState, teamId: string, userId: string) {
    const members = getMembersInTeams(state)[teamId];
    if (members) {
        return members[userId];
    }

    return null;
}

export const getListableTeamIds: (state: GlobalState) => Array<$ID<Team>> = createIdsSelector(
    getTeams,
    getTeamMemberships,
    (state) => haveISystemPermission(state, {permission: Permissions.LIST_PUBLIC_TEAMS}),
    (state) => haveISystemPermission(state, {permission: Permissions.LIST_PRIVATE_TEAMS}),
    isCompatibleWithJoinViewTeamPermissions,
    (teams, myMembers, canListPublicTeams, canListPrivateTeams, compatibleWithJoinViewTeamPermissions) => {
        return Object.keys(teams).filter((id) => {
            const team = teams[id];
            const member = myMembers[id];
            let canList = team.allow_open_invite;
            if (compatibleWithJoinViewTeamPermissions) {
                canList = (canListPrivateTeams && !team.allow_open_invite) || (canListPublicTeams && team.allow_open_invite);
            }
            return team.delete_at === 0 && canList && !member;
        });
    },
);

export const getListableTeams: (state: GlobalState) => Team[] = createSelector(
    getTeams,
    getListableTeamIds,
    (teams, listableTeamIds) => {
        return listableTeamIds.map((id) => teams[id]);
    },
);

export const getSortedListableTeams: (state: GlobalState, locale: string) => Team[] = createSelector(
    getTeams,
    getListableTeamIds,
    (state: GlobalState, locale: string) => locale,
    (teams, listableTeamIds, locale) => {
        const listableTeams: {[x: string]: Team} = {};

        for (const id of listableTeamIds) {
            listableTeams[id] = teams[id];
        }

        return Object.values(listableTeams).sort(sortTeamsWithLocale(locale));
    },
);

export const getJoinableTeamIds: (state: GlobalState) => Array<$ID<Team>> = createIdsSelector(
    getTeams,
    getTeamMemberships,
    (state: GlobalState) => haveISystemPermission(state, {permission: Permissions.JOIN_PUBLIC_TEAMS}),
    (state: GlobalState) => haveISystemPermission(state, {permission: Permissions.JOIN_PRIVATE_TEAMS}),
    isCompatibleWithJoinViewTeamPermissions,
    (teams, myMembers, canJoinPublicTeams, canJoinPrivateTeams, compatibleWithJoinViewTeamPermissions) => {
        return Object.keys(teams).filter((id) => {
            const team = teams[id];
            const member = myMembers[id];
            let canJoin = team.allow_open_invite;
            if (compatibleWithJoinViewTeamPermissions) {
                canJoin = (canJoinPrivateTeams && !team.allow_open_invite) || (canJoinPublicTeams && team.allow_open_invite);
            }
            return team.delete_at === 0 && canJoin && !member;
        });
    },
);

export const getJoinableTeams: (state: GlobalState) => Team[] = createSelector(
    getTeams,
    getJoinableTeamIds,
    (teams, joinableTeamIds) => {
        return joinableTeamIds.map((id) => teams[id]);
    },
);

export const getSortedJoinableTeams: (state: GlobalState, locale: string) => Team[] = createSelector(
    getTeams,
    getJoinableTeamIds,
    (state: GlobalState, locale: string) => locale,
    (teams, joinableTeamIds, locale) => {
        const joinableTeams: {[x: string]: Team} = {};

        for (const id of joinableTeamIds) {
            joinableTeams[id] = teams[id];
        }

        return Object.values(joinableTeams).sort(sortTeamsWithLocale(locale));
    },
);

export const getMySortedTeamIds: (state: GlobalState, locale: string) => Array<$ID<Team>> = createIdsSelector(
    getMyTeams,
    (state: GlobalState, locale: string) => locale,
    (teams, locale) => {
        return teams.sort(sortTeamsWithLocale(locale)).map((t) => t.id);
    },
);

export function getMyTeamsCount(state: GlobalState) {
    return getMyTeams(state).length;
}

// returns the badge number to show (excluding the current team)
// > 0 means is returning the mention count
// 0 means that there are no unread messages
// -1 means that there are unread messages but no mentions
export const getChannelDrawerBadgeCount: (state: GlobalState) => number = createSelector(
    getCurrentTeamId,
    getTeamMemberships,
    (currentTeamId, teamMembers) => {
        let mentionCount = 0;
        let messageCount = 0;
        Object.values(teamMembers).forEach((m: TeamMembership) => {
            if (m.team_id !== currentTeamId) {
                mentionCount += (m.mention_count || 0);
                messageCount += (m.msg_count || 0);
            }
        });

        let badgeCount = 0;
        if (mentionCount) {
            badgeCount = mentionCount;
        } else if (messageCount) {
            badgeCount = -1;
        }

        return badgeCount;
    },
);

// returns the badge for a team
// > 0 means is returning the mention count
// 0 means that there are no unread messages
// -1 means that there are unread messages but no mentions
export function makeGetBadgeCountForTeamId(): (state: GlobalState, id: string) => number {
    return createSelector(
        getTeamMemberships,
        (state: GlobalState, id: string) => id,
        (members, teamId) => {
            const member = members[teamId];
            let badgeCount = 0;

            if (member) {
                if (member.mention_count) {
                    badgeCount = member.mention_count;
                } else if (member.msg_count) {
                    badgeCount = -1;
                }
            }

            return badgeCount;
        },
    );
}
