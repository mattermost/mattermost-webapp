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

export function getMyChannelRoles(state: GlobalState): Dictionary<Set<string>> {
    return state.entities.channels.roles;
}

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

const myChannelPermissions: Dictionary<ReturnType<typeof makeGetMyChannelPermissions>> = {};

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
