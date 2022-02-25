// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';
import {
    getMySystemPermissions,
    getMySystemRoles,
    getRoles,
    PermissionsOptions,
} from 'mattermost-redux/selectors/entities/roles_helpers';
import {getTeamMemberships, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {General, Permissions} from 'mattermost-redux/constants';

import {Role} from 'mattermost-redux/types/roles';
import {GlobalState} from 'mattermost-redux/types/store';
import {GroupMembership, GroupPermissions} from 'mattermost-redux/types/groups';

export {getMySystemPermissions, getMySystemRoles, getRoles};

export const getGroupMemberships: (state: GlobalState) => Record<string, GroupMembership> = createSelector(
    'getGroupMemberships',
    (state) => state.entities.groups.myGroups,
    getCurrentUserId,
    (myGroupIDs: string[], currentUserID: string) => {
        const groupMemberships: Record<string, GroupMembership> = {};
        myGroupIDs.forEach((groupID) => {
            groupMemberships[groupID] = {user_id: currentUserID, roles: General.CUSTOM_GROUP_USER_ROLE};
        });
        return groupMemberships;
    },
);

export const getMyGroupRoles: (state: GlobalState) => Record<string, Set<string>> = createSelector(
    'getMyGroupRoles',
    getGroupMemberships,
    (groupMemberships) => {
        const roles: Record<string, Set<string>> = {};
        if (groupMemberships) {
            for (const key in groupMemberships) {
                if (groupMemberships.hasOwnProperty(key) && groupMemberships[key].roles) {
                    roles[key] = new Set<string>(groupMemberships[key].roles.split(' '));
                }
            }
        }
        return roles;
    },
);

/**
 * Returns a map of permissions, keyed by group id, for all groups that are mentionable and not deleted.
 */
export const getGroupListPermissions: (state: GlobalState) => Record<string, GroupPermissions> = createSelector(
    'getGroupListPermissions',
    getMyGroupRoles,
    getRoles,
    getMySystemPermissions,
    (state) => state.entities.groups.groups,
    (myGroupRoles, roles, systemPermissions, allGroups) => {
        const groups = Object.entries(allGroups).filter((entry) => (entry[1].allow_reference && entry[1].delete_at === 0)).map((entry) => entry[1]);

        const permissions = new Set<string>();
        groups.forEach((group) => {
            const roleNames = myGroupRoles[group.id!];
            if (roleNames) {
                for (const roleName of roleNames) {
                    if (roles[roleName]) {
                        for (const permission of roles[roleName].permissions) {
                            permissions.add(permission);
                        }
                    }
                }
            }
        });

        for (const permission of systemPermissions) {
            permissions.add(permission);
        }

        const groupPermissionsMap: Record<string, GroupPermissions> = {};
        groups.forEach((g) => {
            groupPermissionsMap[g.id] = {
                can_delete: permissions.has(Permissions.DELETE_CUSTOM_GROUP) && g.source.toLowerCase() !== 'ldap',
                can_manage_members: permissions.has(Permissions.MANAGE_CUSTOM_GROUP_MEMBERS) && g.source.toLowerCase() !== 'ldap',
            };
        });
        return groupPermissionsMap;
    },
);

export const getMyTeamRoles: (state: GlobalState) => Record<string, Set<string>> = createSelector(
    'getMyTeamRoles',
    getTeamMemberships,
    (teamsMemberships) => {
        const roles: Record<string, Set<string>> = {};
        if (teamsMemberships) {
            for (const key in teamsMemberships) {
                if (teamsMemberships.hasOwnProperty(key) && teamsMemberships[key].roles) {
                    roles[key] = new Set<string>(teamsMemberships[key].roles.split(' '));
                }
            }
        }
        return roles;
    },
);

export function getMyChannelRoles(state: GlobalState): Record<string, Set<string>> {
    return state.entities.channels.roles;
}

export const getMyRoles: (state: GlobalState) => {
    system: Set<string>;
    team: Record<string, Set<string>>;
    channel: Record<string, Set<string>>;
} = createSelector(
    'getMyRoles',
    getMySystemRoles,
    getMyTeamRoles,
    getMyChannelRoles,
    (systemRoles, teamRoles, channelRoles) => {
        return {
            system: systemRoles,
            team: teamRoles,
            channel: channelRoles,
        };
    },
);

export const getRolesById: (state: GlobalState) => Record<string, Role> = createSelector(
    'getRolesById',
    getRoles,
    (rolesByName) => {
        const rolesById: Record<string, Role> = {};
        for (const role of Object.values(rolesByName)) {
            rolesById[role.id] = role;
        }
        return rolesById;
    },
);

export const getMyCurrentTeamPermissions: (state: GlobalState) => Set<string> = createSelector(
    'getMyCurrentTeamPermissions',
    getMyTeamRoles,
    getRoles,
    getMySystemPermissions,
    getCurrentTeamId,
    (myTeamRoles, roles, systemPermissions, teamId) => {
        const permissions = new Set<string>();
        if (myTeamRoles[teamId]) {
            for (const roleName of myTeamRoles[teamId]) {
                if (roles[roleName]) {
                    for (const permission of roles[roleName].permissions) {
                        permissions.add(permission);
                    }
                }
            }
        }
        for (const permission of systemPermissions) {
            permissions.add(permission);
        }
        return permissions;
    },
);

export const getMyCurrentChannelPermissions: (state: GlobalState) => Set<string> = createSelector(
    'getMyCurrentChannelPermissions',
    getMyChannelRoles,
    getRoles,
    getMyCurrentTeamPermissions,
    getCurrentChannelId,
    (myChannelRoles, roles, teamPermissions, channelId) => {
        const permissions = new Set<string>();
        if (myChannelRoles[channelId]) {
            for (const roleName of myChannelRoles[channelId]) {
                if (roles[roleName]) {
                    for (const permission of roles[roleName].permissions) {
                        permissions.add(permission);
                    }
                }
            }
        }
        for (const permission of teamPermissions) {
            permissions.add(permission);
        }
        return permissions;
    },
);

export const getMyTeamPermissions: (state: GlobalState, team: string) => Set<string> = createSelector(
    'getMyTeamPermissions',
    getMyTeamRoles,
    getRoles,
    getMySystemPermissions,
    (state: GlobalState, team: string) => team,
    (myTeamRoles, roles, systemPermissions, teamId) => {
        const permissions = new Set<string>();
        if (myTeamRoles[teamId!]) {
            for (const roleName of myTeamRoles[teamId!]) {
                if (roles[roleName]) {
                    for (const permission of roles[roleName].permissions) {
                        permissions.add(permission);
                    }
                }
            }
        }
        for (const permission of systemPermissions) {
            permissions.add(permission);
        }
        return permissions;
    },
);

export const getMyGroupPermissions: (state: GlobalState, groupID: string) => Set<string> = createSelector(
    'getMyGroupPermissions',
    getMyGroupRoles,
    getRoles,
    getMySystemPermissions,
    (state: GlobalState, groupID: string) => groupID,
    (myGroupRoles, roles, systemPermissions, groupID) => {
        const permissions = new Set<string>();
        if (myGroupRoles[groupID!]) {
            for (const roleName of myGroupRoles[groupID!]) {
                if (roles[roleName]) {
                    for (const permission of roles[roleName].permissions) {
                        permissions.add(permission);
                    }
                }
            }
        }
        for (const permission of systemPermissions) {
            permissions.add(permission);
        }
        return permissions;
    },
);

const myChannelPermissions: Record<string, ReturnType<typeof makeGetMyChannelPermissions>> = {};

export function getMyChannelPermissions(state: GlobalState, team: string, channel: string): Set<string> {
    let selector = myChannelPermissions[channel];
    if (!selector) {
        selector = makeGetMyChannelPermissions(channel);
        myChannelPermissions[channel] = selector;
    }
    return selector(state, team, channel);
}

function makeGetMyChannelPermissions(channel: string): (state: GlobalState, team: string, channel: string) => Set<string> {
    return createSelector(
        'getMyChannelPermissions_' + channel,
        getMyChannelRoles,
        getRoles,
        getMyTeamPermissions,
        (state, team: string, channel: string) => channel,
        (myChannelRoles, roles, teamPermissions, channelId) => {
            const permissions = new Set<string>();
            if (myChannelRoles[channelId!]) {
                for (const roleName of myChannelRoles[channelId!]) {
                    if (roles[roleName]) {
                        for (const permission of roles[roleName].permissions) {
                            permissions.add(permission);
                        }
                    }
                }
            }
            for (const permission of teamPermissions) {
                permissions.add(permission);
            }
            return permissions;
        },
    );
}

export const haveISystemPermission: (state: GlobalState, options: PermissionsOptions) => boolean = createSelector(
    'haveISystemPermission',
    getMySystemPermissions,
    (state: GlobalState, options: PermissionsOptions) => options.permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);

export const haveITeamPermission: (state: GlobalState, team: string, permission: string) => boolean = createSelector(
    'haveITeamPermission',
    getMyTeamPermissions,
    (state, team, permission) => permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);

export const haveIGroupPermission: (state: GlobalState, groupID: string, permission: string) => boolean = createSelector(
    'haveIGroupPermission',
    getMyGroupPermissions,
    (state: GlobalState, groupID: string, permission: string) => permission,
    (groupPermissions, permission) => {
        return groupPermissions.has(permission);
    },
);

export function haveIChannelPermission(state: GlobalState, team: string, channel: string, permission: string): boolean {
    return getMyChannelPermissions(state, team, channel).has(permission);
}

export const haveICurrentTeamPermission: (state: GlobalState, permission: string) => boolean = createSelector(
    'haveICurrentTeamPermission',
    getMyCurrentTeamPermissions,
    (state: GlobalState, permission: string) => permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);

export function haveICurrentChannelPermission(state: GlobalState, permission: string): boolean {
    return getMyCurrentChannelPermissions(state).has(permission);
}
