// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Permissions} from 'mattermost-redux/constants/index';

function teamMapping(permission) {
    return {
        all: [
            {roleName: 'team_user', permission, shouldHave: true},
        ],
        team_admin: [
            {roleName: 'team_user', permission, shouldHave: false},
            {roleName: 'team_admin', permission, shouldHave: true},
        ],
        system_admin: [
            {roleName: 'team_user', permission, shouldHave: false},
            {roleName: 'team_admin', permission, shouldHave: false},
        ],
    };
}

function channelMapping(permission) {
    return {
        all: [
            {roleName: 'channel_user', permission, shouldHave: true},
        ],
        channel_admin: [
            {roleName: 'channel_user', permission, shouldHave: false},
            {roleName: 'channel_admin', permission, shouldHave: true},
            {roleName: 'team_admin', permission, shouldHave: true},
        ],
        team_admin: [
            {roleName: 'channel_user', permission, shouldHave: false},
            {roleName: 'channel_admin', permission, shouldHave: false},
            {roleName: 'team_admin', permission, shouldHave: true},
        ],
        system_admin: [
            {roleName: 'channel_user', permission, shouldHave: false},
            {roleName: 'channel_admin', permission, shouldHave: false},
            {roleName: 'team_admin', permission, shouldHave: false},
        ],
    };
}

function channelTeamMixedMapping(permission) {
    return {
        all: [
            {roleName: 'team_user', permission, shouldHave: true},
        ],
        channel_admin: [
            {roleName: 'team_user', permission, shouldHave: false},
            {roleName: 'channel_admin', permission, shouldHave: true},
            {roleName: 'team_admin', permission, shouldHave: true},
        ],
        team_admin: [
            {roleName: 'team_user', permission, shouldHave: false},
            {roleName: 'channel_admin', permission, shouldHave: false},
            {roleName: 'team_admin', permission, shouldHave: true},
        ],
        system_admin: [
            {roleName: 'team_user', permission, shouldHave: false},
            {roleName: 'channel_admin', permission, shouldHave: false},
            {roleName: 'team_admin', permission, shouldHave: false},
        ],
    };
}

const MAPPING = {
    restrictTeamInvite: {
        all: [
            {roleName: 'team_user', permission: Permissions.INVITE_USER, shouldHave: true},
            {roleName: 'team_user', permission: Permissions.ADD_USER_TO_TEAM, shouldHave: true},
        ],
        team_admin: [
            {roleName: 'team_user', permission: Permissions.INVITE_USER, shouldHave: false},
            {roleName: 'team_user', permission: Permissions.ADD_USER_TO_TEAM, shouldHave: false},
            {roleName: 'team_admin', permission: Permissions.INVITE_USER, shouldHave: true},
            {roleName: 'team_admin', permission: Permissions.ADD_USER_TO_TEAM, shouldHave: true},
        ],
        system_admin: [
            {roleName: 'team_user', permission: Permissions.INVITE_USER, shouldHave: false},
            {roleName: 'team_user', permission: Permissions.ADD_USER_TO_TEAM, shouldHave: false},
            {roleName: 'team_admin', permission: Permissions.INVITE_USER, shouldHave: false},
            {roleName: 'team_admin', permission: Permissions.ADD_USER_TO_TEAM, shouldHave: false},
        ],
    },
    restrictPublicChannelCreation: {...teamMapping(Permissions.CREATE_PUBLIC_CHANNEL)},
    restrictPrivateChannelCreation: {...teamMapping(Permissions.CREATE_PRIVATE_CHANNEL)},

    restrictPrivateChannelManageMembers: {...channelMapping(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS)},

    restrictPublicChannelManagement: {...channelTeamMixedMapping(Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES)},
    restrictPublicChannelDeletion: {...channelTeamMixedMapping(Permissions.DELETE_PUBLIC_CHANNEL)},
    restrictPrivateChannelManagement: {...channelTeamMixedMapping(Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES)},
    restrictPrivateChannelDeletion: {...channelTeamMixedMapping(Permissions.DELETE_PRIVATE_CHANNEL)},

    allowEditPost: {
        always: [
            {roleName: 'channel_user', permission: Permissions.EDIT_POST, shouldHave: true},
            {roleName: 'system_admin', permission: Permissions.EDIT_POST, shouldHave: true},
        ],
        never: [
            {roleName: 'channel_user', permission: Permissions.EDIT_POST, shouldHave: false},
            {roleName: 'system_admin', permission: Permissions.EDIT_POST, shouldHave: false},
        ],
    },

    restrictPostDelete: {
        all: [
            {roleName: 'channel_user', permission: Permissions.DELETE_POST, shouldHave: true},
            {roleName: 'team_admin', permission: Permissions.DELETE_POST, shouldHave: true},
            {roleName: 'team_admin', permission: Permissions.DELETE_OTHERS_POSTS, shouldHave: true},
        ],
        team_admin: [
            {roleName: 'channel_user', permission: Permissions.DELETE_POST, shouldHave: false},
            {roleName: 'team_admin', permission: Permissions.DELETE_POST, shouldHave: true},
            {roleName: 'team_admin', permission: Permissions.DELETE_OTHERS_POSTS, shouldHave: true},
        ],
        system_admin: [
            {roleName: 'channel_user', permission: Permissions.DELETE_POST, shouldHave: false},
            {roleName: 'team_admin', permission: Permissions.DELETE_POST, shouldHave: false},
            {roleName: 'team_admin', permission: Permissions.DELETE_OTHERS_POSTS, shouldHave: false},
        ],
    },

    enableTeamCreation: {
        true: [{roleName: 'system_user', permission: Permissions.CREATE_TEAM, shouldHave: true}],
        false: [{roleName: 'system_user', permission: Permissions.CREATE_TEAM, shouldHave: false}],
    },

    enableOnlyAdminIntegrations: {
        true: [
            {roleName: 'team_user', permission: Permissions.MANAGE_WEBHOOKS, shouldHave: false},
            {roleName: 'team_user', permission: Permissions.MANAGE_SLASH_COMMANDS, shouldHave: false},
            {roleName: 'system_user', permission: Permissions.MANAGE_OAUTH, shouldHave: false},
        ],
        false: [
            {roleName: 'team_user', permission: Permissions.MANAGE_WEBHOOKS, shouldHave: true},
            {roleName: 'team_user', permission: Permissions.MANAGE_SLASH_COMMANDS, shouldHave: true},
            {roleName: 'system_user', permission: Permissions.MANAGE_OAUTH, shouldHave: true},
        ],
    },
};

/**
 * Get the roles that were changed (but unsaved) for given mapping key/values.
 *
 * @param {object} mappingValues key/value to indicate which mapping items to use to update the roles.
 * @param {object} roles same structure as returned by mattermost-redux `getRoles`.
 * @return {object} the updated roles (only) in the same structure as returned by mattermost-redux `getRoles`.
 */
export function rolesFromMapping(mappingValues, roles) {
    const rolesClone = JSON.parse(JSON.stringify(roles));

    // Purge roles that aren't present in MAPPING, we don't care about them.
    purgeNonPertinentRoles(rolesClone);

    Object.keys(MAPPING).forEach((mappingKey) => {
        const value = mappingValues[mappingKey];
        if (value) {
            mutateRolesBasedOnMapping(mappingKey, value, rolesClone);
        }
    });

    // Purge roles that didn't have permissions changes, we don't care about them.
    Object.entries(rolesClone).forEach(([roleName, roleClone]) => {
        const originalPermissionSet = new Set(roles[roleName].permissions);
        const newPermissionSet = new Set(roleClone.permissions);
        const difference = [...newPermissionSet].filter((x) => !originalPermissionSet.has(x));

        if (originalPermissionSet.size === newPermissionSet.size && difference.length === 0) {
            delete rolesClone[roleName];
        }
    });

    return rolesClone;
}

/**
 * Get the mapping value that matches for a given set of roles.
 *
 * @param {string} key to match under in the mapping.
 * @param {object} roles same structure as returned by mattermost-redux `getRoles`.
 * @return {string} the value that the roles/permissions assignment match in the mapping.
 */
export function mappingValueFromRoles(key, roles) {
    for (const o of mappingPartIterator(MAPPING[key], roles)) {
        if (o.allConditionsAreMet) {
            return o.value;
        }
    }
    throw new Error(`No matching mapping value found for key '${key}' with the given roles.`);
}

function purgeNonPertinentRoles(roles) {
    const pertinentRoleNames = roleNamesInMapping();

    Object.keys(roles).forEach((key) => {
        if (!pertinentRoleNames.includes(key)) {
            delete roles[key];
        }
    });
}

function mutateRolesBasedOnMapping(mappingKey, value, roles) {
    const roleRules = MAPPING[mappingKey][value];

    if (typeof roleRules === 'undefined') {
        throw new Error(`Value '${value}' not present in MAPPING for key '${mappingKey}'.`);
    }

    roleRules.forEach((item) => {
        const role = roles[item.roleName];
        if (item.shouldHave) {
            addPermissionToRole(item.permission, role);
        } else {
            removePermissionFromRole(item.permission, role);
        }
    });
}

// Returns a set of the role names present in MAPPING.
function roleNamesInMapping() {
    let roleNames = [];

    Object.values(MAPPING).forEach((v1) => {
        Object.values(v1).forEach((v2) => {
            const names = v2.map((item) => item.roleName); // eslint-disable-line max-nested-callbacks
            roleNames = roleNames.concat(names);
        });
    });

    return [...new Set(roleNames.map((item) => item))];
}

function* mappingPartIterator(mappingPart, roles) {
    for (const value in mappingPart) {
        if (mappingPart.hasOwnProperty(value)) {
            const roleRules = mappingPart[value];

            const hasUnmetCondition = roleRules.some((item) => {
                const role = roles[item.roleName];
                return (item.shouldHave && !role.permissions.includes(item.permission)) || (!item.shouldHave && role.permissions.includes(item.permission));
            });

            yield {value, allConditionsAreMet: !hasUnmetCondition};
        }
    }
}

function addPermissionToRole(permission, role) {
    if (!role.permissions.includes(permission)) {
        role.permissions.push(permission);
    }
}

function removePermissionFromRole(permission, role) {
    const permissionIndex = role.permissions.indexOf(permission);
    if (permissionIndex !== -1) {
        role.permissions.splice(permissionIndex, 1);
    }
}
