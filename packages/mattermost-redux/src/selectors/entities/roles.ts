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

import {Role} from 'mattermost-redux/types/roles';
import {GlobalState} from 'mattermost-redux/types/store';
import {Dictionary} from 'mattermost-redux/types/utilities';

export {getMySystemPermissions, getMySystemRoles, getRoles};

export const getMyTeamRoles: (state: GlobalState) => Dictionary<Set<string>> = createSelector(
    'getMyTeamRoles',
    getTeamMemberships,
    (teamsMemberships) => {
        const roles: Dictionary<Set<string>> = {};
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

export const getMyChannelRoles: (state: GlobalState) => Dictionary<Set<string>> = createSelector(
    'getMyChannelRoles',
    (state: GlobalState) => state.entities.channels.myMembers,
    (channelsMemberships) => {
        const roles: Dictionary<Set<string>> = {};
        if (channelsMemberships) {
            for (const key in channelsMemberships) {
                if (channelsMemberships.hasOwnProperty(key) && channelsMemberships[key].roles) {
                    roles[key] = new Set<string>(channelsMemberships[key].roles.split(' '));
                }
            }
        }
        return roles;
    },
);

export const getMyRoles: (state: GlobalState) => {
    system: Set<string>;
    team: Dictionary<Set<string>>;
    channel: Dictionary<Set<string>>;
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

export const getRolesById: (state: GlobalState) => Dictionary<Role> = createSelector(
    'getRolesById',
    getRoles,
    (rolesByName) => {
        const rolesById: Dictionary<Role> = {};
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

export const getMyTeamPermissions: (state: GlobalState, options: PermissionsOptions) => Set<string> = createSelector(
    'getMyTeamPermissions',
    getMyTeamRoles,
    getRoles,
    getMySystemPermissions,
    (state: GlobalState, options: PermissionsOptions) => options.team,
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

export const getMyChannelPermissions: (state: GlobalState, options: PermissionsOptions) => Set<string> = createSelector(
    'getMyChannelPermissions',
    getMyChannelRoles,
    getRoles,
    getMyTeamPermissions,
    (state, options: PermissionsOptions) => options.channel,
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

export const haveISystemPermission: (state: GlobalState, options: PermissionsOptions) => boolean = createSelector(
    'haveISystemPermission',
    getMySystemPermissions,
    (state: GlobalState, options: PermissionsOptions) => options.permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);

export const haveITeamPermission: (state: GlobalState, options: PermissionsOptions) => boolean = createSelector(
    'haveITeamPermission',
    getMyTeamPermissions,
    (state, options) => options.permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);

export const haveIChannelPermission: (state: GlobalState, options: PermissionsOptions) => boolean = createSelector(
    'haveIChannelPermission',
    getMyChannelPermissions,
    (state, options) => options.permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);

export const haveICurrentTeamPermission: (state: GlobalState, options: PermissionsOptions) => boolean = createSelector(
    'haveICurrentTeamPermission',
    getMyCurrentTeamPermissions,
    (state: GlobalState, options: PermissionsOptions) => options.permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);

export const haveICurrentChannelPermission: (state: GlobalState, options: PermissionsOptions) => boolean = createSelector(
    'haveICurrentChannelPermission',
    getMyCurrentChannelPermissions,
    (state: GlobalState, options: PermissionsOptions) => options.permission,
    (permissions, permission) => {
        return permissions.has(permission);
    },
);
