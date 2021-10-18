// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import {createSelector} from 'reselect';

import {
    getCurrentChannelId,
    getCurrentUser,
    getCurrentUserId,
    getMyCurrentChannelMembership,
    getUsers,
    getMembersInTeam,
    getMembersInChannel,
} from 'mattermost-redux/selectors/entities/common';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';
import {getDirectShowPreferences, getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';

import {
    displayUsername,
    filterProfilesStartingWithTerm,
    filterProfilesMatchingWithTerm,
    isSystemAdmin,
    includesAnAdminRole,
    profileListToMap,
    sortByUsername,
    applyRolesFilters,
} from 'mattermost-redux/utils/user_utils';

import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {Reaction} from 'mattermost-redux/types/reactions';
import {GlobalState} from 'mattermost-redux/types/store';
import {Team, TeamMembership} from 'mattermost-redux/types/teams';
import {Group} from 'mattermost-redux/types/groups';
import {UserProfile} from 'mattermost-redux/types/users';
import {
    $Email,
    $ID,
    $Username,
    Dictionary,
    EmailMappedObjects,
    IDMappedObjects,
    RelationOneToMany,
    RelationOneToOne,
    UsernameMappedObjects,
} from 'mattermost-redux/types/utilities';

export {getCurrentUser, getCurrentUserId, getUsers};

type Filters = {
    role?: string;
    inactive?: boolean;
    active?: boolean;
    roles?: string[];
    exclude_roles?: string[];
    channel_roles?: string[];
    team_roles?: string[];
};

export function getUserIdsInChannels(state: GlobalState): RelationOneToMany<Channel, UserProfile> {
    return state.entities.users.profilesInChannel;
}

export function getUserIdsNotInChannels(state: GlobalState): RelationOneToMany<Channel, UserProfile> {
    return state.entities.users.profilesNotInChannel;
}

export function getUserIdsInTeams(state: GlobalState): RelationOneToMany<Team, UserProfile> {
    return state.entities.users.profilesInTeam;
}

export function getUserIdsNotInTeams(state: GlobalState): RelationOneToMany<Team, UserProfile> {
    return state.entities.users.profilesNotInTeam;
}

export function getUserIdsWithoutTeam(state: GlobalState): Set<$ID<UserProfile>> {
    return state.entities.users.profilesWithoutTeam;
}

export function getUserIdsInGroups(state: GlobalState): RelationOneToMany<Group, UserProfile> {
    return state.entities.users.profilesInGroup;
}

export function getUserStatuses(state: GlobalState): RelationOneToOne<UserProfile, string> {
    return state.entities.users.statuses;
}

export function getUserSessions(state: GlobalState): any[] {
    return state.entities.users.mySessions;
}

export function getUserAudits(state: GlobalState): any[] {
    return state.entities.users.myAudits;
}

export function getUser(state: GlobalState, id: $ID<UserProfile>): UserProfile {
    return state.entities.users.profiles[id];
}

export const getUsersByUsername: (a: GlobalState) => UsernameMappedObjects<UserProfile> = createSelector(
    'getUsersByUsername',
    getUsers,
    (users) => {
        const usersByUsername: Dictionary<UserProfile> = {};

        for (const id in users) {
            if (users.hasOwnProperty(id)) {
                const user = users[id];
                usersByUsername[user.username] = user;
            }
        }

        return usersByUsername;
    },
);

export function getUserByUsername(state: GlobalState, username: $Username<UserProfile>): UserProfile {
    return getUsersByUsername(state)[username];
}

export const getUsersByEmail: (a: GlobalState) => EmailMappedObjects<UserProfile> = createSelector(
    'getUsersByEmail',
    getUsers,
    (users) => {
        const usersByEmail: Dictionary<UserProfile> = {};

        for (const user of Object.keys(users).map((key) => users[key])) {
            usersByEmail[user.email] = user;
        }

        return usersByEmail;
    },
);

export function getUserByEmail(state: GlobalState, email: $Email<UserProfile>): UserProfile {
    return getUsersByEmail(state)[email];
}

export const isCurrentUserSystemAdmin: (state: GlobalState) => boolean = createSelector(
    'isCurrentUserSystemAdmin',
    getCurrentUser,
    (user) => {
        const roles = user?.roles || '';
        return isSystemAdmin(roles);
    },
);

export const currentUserHasAnAdminRole: (state: GlobalState) => boolean = createSelector(
    'currentUserHasAnAdminRole',
    getCurrentUser,
    (user) => {
        const roles = user.roles || '';
        return includesAnAdminRole(roles);
    },
);

export const getCurrentUserRoles: (a: GlobalState) => UserProfile['roles'] = createSelector(
    'getCurrentUserRoles',
    getMyCurrentChannelMembership,
    (state) => state.entities.teams.myMembers[state.entities.teams.currentTeamId],
    getCurrentUser,
    (currentChannelMembership, currentTeamMembership, currentUser) => {
        let roles = '';
        if (currentTeamMembership) {
            roles += `${currentTeamMembership.roles} `;
        }

        if (currentChannelMembership) {
            roles += `${currentChannelMembership.roles} `;
        }

        if (currentUser) {
            roles += currentUser.roles;
        }
        return roles.trim();
    },
);

export type UserMentionKey= {
    key: string;
    caseSensitive?: boolean;
}

export const getCurrentUserMentionKeys: (state: GlobalState) => UserMentionKey[] = createSelector(
    'getCurrentUserMentionKeys',
    getCurrentUser,
    (user: UserProfile) => {
        let keys: UserMentionKey[] = [];

        if (!user || !user.notify_props) {
            return keys;
        }

        if (user.notify_props.mention_keys) {
            keys = keys.concat(user.notify_props.mention_keys.split(',').map((key) => {
                return {key};
            }));
        }

        if (user.notify_props.first_name === 'true' && user.first_name) {
            keys.push({key: user.first_name, caseSensitive: true});
        }

        if (user.notify_props.channel === 'true') {
            keys.push({key: '@channel'});
            keys.push({key: '@all'});
            keys.push({key: '@here'});
        }

        const usernameKey = '@' + user.username;
        if (keys.findIndex((key) => key.key === usernameKey) === -1) {
            keys.push({key: usernameKey});
        }

        return keys;
    },
);

export const getProfileSetInCurrentChannel: (state: GlobalState) => Array<$ID<UserProfile>> = createSelector(
    'getProfileSetInCurrentChannel',
    getCurrentChannelId,
    getUserIdsInChannels,
    (currentChannel, channelProfiles) => {
        return channelProfiles[currentChannel];
    },
);

export const getProfileSetNotInCurrentChannel: (state: GlobalState) => Array<$ID<UserProfile>> = createSelector(
    'getProfileSetNotInCurrentChannel',
    getCurrentChannelId,
    getUserIdsNotInChannels,
    (currentChannel, channelProfiles) => {
        return channelProfiles[currentChannel];
    },
);

export const getProfileSetInCurrentTeam: (state: GlobalState) => Array<$ID<UserProfile>> = createSelector(
    'getProfileSetInCurrentTeam',
    (state) => state.entities.teams.currentTeamId,
    getUserIdsInTeams,
    (currentTeam, teamProfiles) => {
        return teamProfiles[currentTeam];
    },
);

export const getProfileSetNotInCurrentTeam: (state: GlobalState) => Array<$ID<UserProfile>> = createSelector(
    'getProfileSetNotInCurrentTeam',
    (state) => state.entities.teams.currentTeamId,
    getUserIdsNotInTeams,
    (currentTeam, teamProfiles) => {
        return teamProfiles[currentTeam];
    },
);

const PROFILE_SET_ALL = 'all';
function sortAndInjectProfiles(profiles: IDMappedObjects<UserProfile>, profileSet?: 'all' | Array<$ID<UserProfile>> | Set<$ID<UserProfile>>): UserProfile[] {
    let currentProfiles: UserProfile[] = [];

    if (typeof profileSet === 'undefined') {
        return currentProfiles;
    } else if (profileSet === PROFILE_SET_ALL) {
        currentProfiles = Object.keys(profiles).map((key) => profiles[key]);
    } else {
        currentProfiles = Array.from(profileSet).map((p) => profiles[p]);
    }

    currentProfiles = currentProfiles.filter((profile) => Boolean(profile));

    return currentProfiles.sort(sortByUsername);
}

export const getProfiles: (state: GlobalState, filters?: Filters) => UserProfile[] = createSelector(
    'getProfiles',
    getUsers,
    (state: GlobalState, filters?: Filters) => filters,
    (profiles, filters) => {
        return sortAndInjectProfiles(filterProfiles(profiles, filters), PROFILE_SET_ALL);
    },
);

export function filterProfiles(profiles: IDMappedObjects<UserProfile>, filters?: Filters, memberships?: RelationOneToOne<UserProfile, TeamMembership> | RelationOneToOne<UserProfile, ChannelMembership>): IDMappedObjects<UserProfile> {
    if (!filters) {
        return profiles;
    }

    let users = Object.keys(profiles).map((key) => profiles[key]);

    const filterRole = (filters.role && filters.role !== '') ? [filters.role] : [];
    const filterRoles = [...filterRole, ...(filters.roles || []), ...(filters.team_roles || []), ...(filters.channel_roles || [])];
    const excludeRoles = filters.exclude_roles || [];
    if (filterRoles.length > 0 || excludeRoles.length > 0) {
        users = users.filter((user) => {
            return user.roles.length > 0 && applyRolesFilters(user, filterRoles, excludeRoles, memberships?.[user.id]);
        });
    }

    if (filters.inactive) {
        users = users.filter((user) => user.delete_at !== 0);
    } else if (filters.active) {
        users = users.filter((user) => user.delete_at === 0);
    }

    return users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as IDMappedObjects<UserProfile>);
}

export function getIsManualStatusForUserId(state: GlobalState, userId: $ID<UserProfile>): boolean {
    return state.entities.users.isManualStatus[userId];
}

export const getProfilesInCurrentChannel: (state: GlobalState) => UserProfile[] = createSelector(
    'getProfilesInCurrentChannel',
    getUsers,
    getProfileSetInCurrentChannel,
    (profiles, currentChannelProfileSet) => {
        return sortAndInjectProfiles(profiles, currentChannelProfileSet);
    },
);

export const getProfilesNotInCurrentChannel: (state: GlobalState) => UserProfile[] = createSelector(
    'getProfilesNotInCurrentChannel',
    getUsers,
    getProfileSetNotInCurrentChannel,
    (profiles, notInCurrentChannelProfileSet) => {
        return sortAndInjectProfiles(profiles, notInCurrentChannelProfileSet);
    },
);

export const getProfilesInCurrentTeam: (state: GlobalState) => UserProfile[] = createSelector(
    'getProfilesInCurrentTeam',
    getUsers,
    getProfileSetInCurrentTeam,
    (profiles, currentTeamProfileSet) => {
        return sortAndInjectProfiles(profiles, currentTeamProfileSet);
    },
);

export const getProfilesInTeam: (state: GlobalState, teamId: $ID<Team>, filters?: Filters) => UserProfile[] = createSelector(
    'getProfilesInTeam',
    getUsers,
    getUserIdsInTeams,
    getMembersInTeam,
    (state: GlobalState, teamId: string) => teamId,
    (state: GlobalState, teamId: string, filters: Filters) => filters,
    (profiles, usersInTeams, memberships, teamId, filters) => {
        return sortAndInjectProfiles(filterProfiles(profiles, filters, memberships), usersInTeams[teamId] || new Set());
    },
);

export const getProfilesNotInTeam: (state: GlobalState, teamId: $ID<Team>, filters?: Filters) => UserProfile[] = createSelector(
    'getProfilesNotInTeam',
    getUsers,
    getUserIdsNotInTeams,
    (state: GlobalState, teamId: string) => teamId,
    (state: GlobalState, teamId: string, filters: Filters) => filters,
    (profiles, usersNotInTeams, teamId, filters) => {
        return sortAndInjectProfiles(filterProfiles(profiles, filters), usersNotInTeams[teamId] || new Set());
    },
);

export const getProfilesNotInCurrentTeam: (state: GlobalState) => UserProfile[] = createSelector(
    'getProfilesNotInCurrentTeam',
    getUsers,
    getProfileSetNotInCurrentTeam,
    (profiles, notInCurrentTeamProfileSet) => {
        return sortAndInjectProfiles(profiles, notInCurrentTeamProfileSet);
    },
);

export const getProfilesWithoutTeam: (state: GlobalState, filters: Filters) => UserProfile[] = createSelector(
    'getProfilesWithoutTeam',
    getUsers,
    getUserIdsWithoutTeam,
    (state: GlobalState, filters: Filters) => filters,
    (profiles, withoutTeamProfileSet, filters) => {
        return sortAndInjectProfiles(filterProfiles(profiles, filters), withoutTeamProfileSet);
    },
);

export function getStatusForUserId(state: GlobalState, userId: $ID<UserProfile>): string {
    return getUserStatuses(state)[userId];
}

export function getTotalUsersStats(state: GlobalState): any {
    return state.entities.users.stats;
}

export function getFilteredUsersStats(state: GlobalState): any {
    return state.entities.users.filteredStats;
}

function filterFromProfiles(currentUserId: $ID<UserProfile>, profiles: UserProfile[], skipCurrent = false, filters?: Filters): UserProfile[] {
    const filteredProfilesMap = filterProfiles(profileListToMap(profiles), filters);
    const filteredProfiles = Object.keys(filteredProfilesMap).map((key) => filteredProfilesMap[key]);

    if (skipCurrent) {
        removeCurrentUserFromList(filteredProfiles, currentUserId);
    }

    return filteredProfiles;
}

export function makeSearchProfilesStartingWithTerm(): (state: GlobalState, term: string, skipCurrent?: boolean, filters?: Filters) => UserProfile[] {
    return createSelector(
        'makeSearchProfilesStartingWithTerm',
        getUsers,
        getCurrentUserId,
        (state: GlobalState, term: string) => term,
        (state: GlobalState, term: string, skipCurrent?: boolean) => skipCurrent || false,
        (stateGlobalState, term: string, skipCurrent?: boolean, filters?: Filters) => filters,
        (users, currentUserId, term, skipCurrent, filters) => {
            const profiles = filterProfilesStartingWithTerm(Object.values(users), term);
            return filterFromProfiles(currentUserId, profiles, skipCurrent, filters);
        },
    );
}

export function makeSearchProfilesMatchingWithTerm(): (state: GlobalState, term: string, skipCurrent?: boolean, filters?: Filters) => UserProfile[] {
    return createSelector(
        'makeSearchProfilesMatchingWithTerm',
        getUsers,
        getCurrentUserId,
        (state: GlobalState, term: string) => term,
        (state: GlobalState, term: string, skipCurrent?: boolean) => skipCurrent || false,
        (stateGlobalState, term: string, skipCurrent?: boolean, filters?: Filters) => filters,
        (users, currentUserId, term, skipCurrent, filters) => {
            const profiles = filterProfilesMatchingWithTerm(Object.values(users), term);
            return filterFromProfiles(currentUserId, profiles, skipCurrent, filters);
        },
    );
}

export function makeSearchProfilesInChannel() {
    const doGetProfilesInChannel = makeGetProfilesInChannel();
    return (state: GlobalState, channelId: $ID<Channel>, term: string, skipCurrent = false, filters?: Filters): UserProfile[] => {
        const profiles = filterProfilesStartingWithTerm(doGetProfilesInChannel(state, channelId, filters), term);

        if (skipCurrent) {
            removeCurrentUserFromList(profiles, getCurrentUserId(state));
        }

        return profiles;
    };
}

export function searchProfilesInCurrentChannel(state: GlobalState, term: string, skipCurrent = false): UserProfile[] {
    const profiles = filterProfilesStartingWithTerm(getProfilesInCurrentChannel(state), term);

    if (skipCurrent) {
        removeCurrentUserFromList(profiles, getCurrentUserId(state));
    }

    return profiles;
}

export function searchProfilesNotInCurrentChannel(state: GlobalState, term: string, skipCurrent = false): UserProfile[] {
    const profiles = filterProfilesStartingWithTerm(getProfilesNotInCurrentChannel(state), term);
    if (skipCurrent) {
        removeCurrentUserFromList(profiles, getCurrentUserId(state));
    }

    return profiles;
}

export function searchProfilesInCurrentTeam(state: GlobalState, term: string, skipCurrent = false): UserProfile[] {
    const profiles = filterProfilesStartingWithTerm(getProfilesInCurrentTeam(state), term);
    if (skipCurrent) {
        removeCurrentUserFromList(profiles, getCurrentUserId(state));
    }

    return profiles;
}

export function searchProfilesInTeam(state: GlobalState, teamId: $ID<Team>, term: string, skipCurrent = false, filters?: Filters): UserProfile[] {
    const profiles = filterProfilesStartingWithTerm(getProfilesInTeam(state, teamId, filters), term);
    if (skipCurrent) {
        removeCurrentUserFromList(profiles, getCurrentUserId(state));
    }

    return profiles;
}

export function searchProfilesNotInCurrentTeam(state: GlobalState, term: string, skipCurrent = false): UserProfile[] {
    const profiles = filterProfilesStartingWithTerm(getProfilesNotInCurrentTeam(state), term);
    if (skipCurrent) {
        removeCurrentUserFromList(profiles, getCurrentUserId(state));
    }

    return profiles;
}

export function searchProfilesWithoutTeam(state: GlobalState, term: string, skipCurrent = false, filters: Filters): UserProfile[] {
    const filteredProfiles = filterProfilesStartingWithTerm(getProfilesWithoutTeam(state, filters), term);
    if (skipCurrent) {
        removeCurrentUserFromList(filteredProfiles, getCurrentUserId(state));
    }

    return filteredProfiles;
}

function removeCurrentUserFromList(profiles: UserProfile[], currentUserId: $ID<UserProfile>) {
    const index = profiles.findIndex((p) => p.id === currentUserId);
    if (index >= 0) {
        profiles.splice(index, 1);
    }
}

export const shouldShowTermsOfService: (state: GlobalState) => boolean = createSelector(
    'shouldShowTermsOfService',
    getConfig,
    getCurrentUser,
    getLicense,
    (config, user, license) => {
        // Defaults to false if the user is not logged in or the setting doesn't exist
        const acceptedTermsId = user ? user.terms_of_service_id : '';
        const acceptedAt = user ? user.terms_of_service_create_at : 0;

        const featureEnabled = license.IsLicensed === 'true' && config.EnableCustomTermsOfService === 'true';
        const reacceptanceTime = parseInt(config.CustomTermsOfServiceReAcceptancePeriod!, 10) * 1000 * 60 * 60 * 24;
        const timeElapsed = new Date().getTime() - acceptedAt;
        return Boolean(user && featureEnabled && (config.CustomTermsOfServiceId !== acceptedTermsId || timeElapsed > reacceptanceTime));
    },
);

export const getUsersInVisibleDMs: (state: GlobalState) => UserProfile[] = createSelector(
    'getUsersInVisibleDMs',
    getUsers,
    getDirectShowPreferences,
    (users, preferences) => {
        const dmUsers: UserProfile[] = [];
        preferences.forEach((pref) => {
            if (pref.value === 'true' && users[pref.name]) {
                dmUsers.push(users[pref.name]);
            }
        });
        return dmUsers;
    },
);

export function makeGetProfilesForReactions(): (state: GlobalState, reactions: Reaction[]) => UserProfile[] {
    return createSelector(
        'makeGetProfilesForReactions',
        getUsers,
        (state: GlobalState, reactions: Reaction[]) => reactions,
        (users, reactions) => {
            const profiles: UserProfile[] = [];
            reactions.forEach((r) => {
                if (users[r.user_id]) {
                    profiles.push(users[r.user_id]);
                }
            });
            return profiles;
        },
    );
}

export function makeGetProfilesInChannel(): (state: GlobalState, channelId: $ID<Channel>, filters?: Filters) => UserProfile[] {
    return createSelector(
        'makeGetProfilesInChannel',
        getUsers,
        getUserIdsInChannels,
        getMembersInChannel,
        (state: GlobalState, channelId: string) => channelId,
        (state, channelId, filters) => filters,
        (users, userIds, membersInChannel, channelId, filters = {}) => {
            const userIdsInChannel = userIds[channelId];

            if (!userIdsInChannel) {
                return [];
            }

            return sortAndInjectProfiles(filterProfiles(users, filters, membersInChannel), userIdsInChannel);
        },
    );
}

export function makeGetProfilesNotInChannel(): (state: GlobalState, channelId: $ID<Channel>, filters?: Filters) => UserProfile[] {
    return createSelector(
        'makeGetProfilesNotInChannel',
        getUsers,
        getUserIdsNotInChannels,
        (state: GlobalState, channelId: string) => channelId,
        (state, channelId, filters) => filters,
        (users, userIds, channelId, filters = {}) => {
            const userIdsInChannel = userIds[channelId];

            if (!userIdsInChannel) {
                return [];
            } else if (filters) {
                return sortAndInjectProfiles(filterProfiles(users, filters), userIdsInChannel);
            }

            return sortAndInjectProfiles(users, userIdsInChannel);
        },
    );
}

export function makeGetProfilesByIdsAndUsernames(): (
    state: GlobalState,
    props: {
        allUserIds: Array<$ID<UserProfile>>;
        allUsernames: Array<$Username<UserProfile>>;
    }
) => UserProfile[] {
    return createSelector(
        'makeGetProfilesByIdsAndUsernames',
        getUsers,
        getUsersByUsername,
        (state: GlobalState, props: {allUserIds: Array<$ID<UserProfile>>; allUsernames: Array<$Username<UserProfile>>}) => props.allUserIds,
        (state, props) => props.allUsernames,
        (allProfilesById: Dictionary<UserProfile>, allProfilesByUsername: Dictionary<UserProfile>, allUserIds: string[], allUsernames: string[]) => {
            const userProfiles: UserProfile[] = [];

            if (allUserIds && allUserIds.length > 0) {
                const profilesById = allUserIds.
                    filter((userId) => allProfilesById[userId]).
                    map((userId) => allProfilesById[userId]);

                if (profilesById && profilesById.length > 0) {
                    userProfiles.push(...profilesById);
                }
            }

            if (allUsernames && allUsernames.length > 0) {
                const profilesByUsername = allUsernames.
                    filter((username) => allProfilesByUsername[username]).
                    map((username) => allProfilesByUsername[username]);

                if (profilesByUsername && profilesByUsername.length > 0) {
                    userProfiles.push(...profilesByUsername);
                }
            }

            return userProfiles;
        },
    );
}

export function makeGetDisplayName(): (state: GlobalState, userId: $ID<UserProfile>, useFallbackUsername?: boolean) => string {
    return createSelector(
        'makeGetDisplayName',
        (state: GlobalState, userId: string) => getUser(state, userId),
        getTeammateNameDisplaySetting,
        (state, userId, useFallbackUsername = true) => useFallbackUsername,
        (user, teammateNameDisplaySetting, useFallbackUsername) => {
            return displayUsername(user, teammateNameDisplaySetting!, useFallbackUsername);
        },
    );
}

export function makeDisplayNameGetter(): (state: GlobalState, useFallbackUsername: boolean) => (user: UserProfile | null | undefined) => string {
    return createSelector(
        'makeDisplayNameGetter',
        getTeammateNameDisplaySetting,
        (_, useFallbackUsername = true) => useFallbackUsername,
        (teammateNameDisplaySetting, useFallbackUsername) => {
            return (user: UserProfile | null | undefined) => displayUsername(user, teammateNameDisplaySetting!, useFallbackUsername);
        },
    );
}

export const getProfilesInGroup: (state: GlobalState, groupId: $ID<Group>, filters?: Filters) => UserProfile[] = createSelector(
    'getProfilesInGroup',
    getUsers,
    getUserIdsInGroups,
    (state: GlobalState, groupId: string) => groupId,
    (state: GlobalState, groupId: string, filters: Filters) => filters,
    (profiles, usersInGroups, groupId, filters) => {
        return sortAndInjectProfiles(filterProfiles(profiles, filters), usersInGroups[groupId] || new Set());
    },
);

export function searchProfilesInGroup(state: GlobalState, groupId: $ID<Group>, term: string, skipCurrent = false, filters?: Filters): UserProfile[] {
    const profiles = filterProfilesStartingWithTerm(getProfilesInGroup(state, groupId, filters), term);
    if (skipCurrent) {
        removeCurrentUserFromList(profiles, getCurrentUserId(state));
    }

    return profiles;
}
