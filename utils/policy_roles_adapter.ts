// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as D from 'json-decoder';

import {Role} from '@mattermost/types/roles';

import {Permissions} from 'mattermost-redux/constants/index';

// enumeration of possible values for Mapping type
enum MMPermission {
    CREATE_TEAM = 'create_team',
    EDIT_OTHERS_POSTS = 'edit_others_posts',
    MANAGE_INCOMING_WEBHOOKS = 'manage_incoming_webhooks',
    MANAGE_OUTGOING_WEBHOOKS = 'manage_outgoing_webhooks',
    MANAGE_SLASH_COMMANDS = 'manage_slash_commands',
    MANAGE_OAUTH = 'manage_oauth',
}

// Mapping types
// ------------

type MappingKey =
  | 'enableTeamCreation'
  | 'editOthersPosts'
  | 'enableOnlyAdminIntegrations';

type MappingOption = 'true' | 'false';

type MappingRoleName =
  | 'team_user'
  | 'team_admin'
  | 'system_admin'
  | 'system_user';

type MappingRole = {
    roleName: MappingRoleName;
    permission: MMPermission;
    shouldHave: boolean;
};

type MappingValue = {
    true: MappingRole[];
    false: MappingRole[];
};

type Mapping = {
    enableTeamCreation: MappingValue;
    editOthersPosts: MappingValue;
    enableOnlyAdminIntegrations: MappingValue;
};

type MMPermissions = {
    CREATE_TEAM: string;
    EDIT_OTHERS_POSTS: string;
    MANAGE_INCOMING_WEBHOOKS: string;
    MANAGE_OUTGOING_WEBHOOKS: string;
    MANAGE_SLASH_COMMANDS: string;
    MANAGE_OAUTH: string;
};

// Policy types
// ------------

type Policy = {
    editOthersPosts?: string;
    enableTeamCreation?: string;
    enableOnlyAdminIntegrations?: string;
};

// Role types
// ----------

type Roles = {
    system_user: Role;
    system_admin: Role;
    team_admin: Role;
    team_user: Role;
};

// Decoders, to check if unknown object is valid,
// also usefull to check the validity of types
// after JSON has been decoded
// -------------------------------------------

const policyTrueDecoder = D.exactDecoder('true');
const policyFalseDecoder = D.exactDecoder('false');
const policyValueDecoder = D.oneOfDecoders(
    policyTrueDecoder,
    policyFalseDecoder,
    D.undefinedDecoder,
);

const policyDecoder = D.objectDecoder<Policy>({
    editOthersPosts: policyValueDecoder,
    enableTeamCreation: policyValueDecoder,
    enableOnlyAdminIntegrations: policyValueDecoder,
});

//  Decode mattremost Permissions.
//  To check if MMPermission have the correct values
const mattermostPermissionsDecoder = D.objectDecoder<MMPermissions>({
    CREATE_TEAM: D.exactDecoder(MMPermission.CREATE_TEAM),
    EDIT_OTHERS_POSTS: D.exactDecoder(MMPermission.EDIT_OTHERS_POSTS),
    MANAGE_INCOMING_WEBHOOKS: D.exactDecoder(
        MMPermission.MANAGE_INCOMING_WEBHOOKS,
    ),
    MANAGE_OUTGOING_WEBHOOKS: D.exactDecoder(
        MMPermission.MANAGE_OUTGOING_WEBHOOKS,
    ),
    MANAGE_SLASH_COMMANDS: D.exactDecoder(MMPermission.MANAGE_SLASH_COMMANDS),
    MANAGE_OAUTH: D.exactDecoder(MMPermission.MANAGE_OAUTH),
});

// Check JSON valid types
// ---------------------------

// Given Policy should remove undefined properties
//
// Policy => Policy
function removeUndefinedPropertiesPolicy(policy: Policy): Policy {
    return Object.fromEntries(
        Object.entries(policy).filter(([, value]) => value !== undefined),
    );
}

// Given JSON object, should remove undefined values from decoded policies
//
// (unknown) => D.Result<Policy>
function decodePolicies(policies: unknown): D.Result<Policy> {
    return policyDecoder.decode(policies).map(removeUndefinedPropertiesPolicy);
}

// Given D.Result<Policy> should check Result.type === 'OK' and return Policy
// else show an error and return empty object
//
// D.Result<Policy> => Policy
function checkPolicies(policies: D.Result<Policy>): Policy {
    switch (policies.type) {
    case 'OK':
        return policies.value;
    case 'ERR':
        console.error( //eslint-disable-line no-console
            policies.message,
            'values for Policy should be \'true\', \'false\' ',
        );
        return {} as Policy;
    default:
        return {} as Policy;
    }
}

// Given permissions object, should return true if key/value are valid,
// else show an error return false
// we need to validate MMPermission, to match mattermost permissions keys/values
//
// unknown => boolean
function isValidPermissions(permissions: unknown = {}): boolean {
    const result = mattermostPermissionsDecoder.decode(permissions);
    switch (result.type) {
    case 'OK':
        return true;
    case 'ERR':
        console.error( //eslint-disable-line no-console
            result.message,
            '. MMPermission should match with mattermost Permissions, same keys and values',
        );
        return false;
    default:
        return false;
    }
}

// Roles data
// ------------

// Given Mapping, MappingKey, MappingOption, should return a list of MappingRole
//
// Mapping => MappingKey => MappingOption => MappingRole[]
function getMappingRoles(
    mapping: Mapping,
    key: MappingKey,
    value: MappingOption,
): MappingRole[] {
    return mapping[key][value];
}

// Given MMPermission, Role, should
// add to role.permissions permission value
// role permissions list should contain unique values
//
// MMPermission => Role => Role
function addPermissionToRolePermissions(
    permission: MMPermission,
    role: Role,
): Role {
    return {
        ...role,
        permissions: [...new Set([...role.permissions, permission])],
    };
}

// Given MMPermission, Role, should remove the permission
// from role.permissions list
//
// MMPermission => RoleValue => RoleValue
function removePermissionFromRolePermissions(
    permission: MMPermission,
    role: Role,
): Role {
    return {
        ...role,
        permissions: role.permissions.filter(
            (rolePermission) => rolePermission !== permission,
        ),
    };
}

// Given list MappingRole, Roles, iterate over MappingRole comparing
// MappingRole.name with Roles keys, if equals add or remove permission from role,
// based on shouldHave value
//
// MappingRole[] => Roles => Roles
function addOrRemovePermissions(
    mappingRoles: MappingRole[],
    roles: Roles,
): Roles {
    return mappingRoles.reduce((acc, mappingRole) => {
        const {roleName, permission, shouldHave} = mappingRole;
        const roleValue = acc[roleName];
        if (roleValue) {
            const newRoleValue =
            shouldHave ? addPermissionToRolePermissions(permission, roleValue) : removePermissionFromRolePermissions(permission, roleValue);
            return {...acc, [roleName]: newRoleValue};
        }
        return acc;
    }, roles);
}

// Policy data
// ------------

// Given Policy, Mapping should getMappingRoles for each key and value
// return a list of MappingRole.
// If policy is empty, return an empty list
//
// Policy => Mapping => MappingRole[]
function getPolicyMappingRoles(
    policy: Policy,
    mapping: Mapping,
): MappingRole[] {
    if (Object.keys(policy).length === 0) {
        return [] as MappingRole[];
    }

    return Object.entries(policy).flatMap(([key, value]) =>
        getMappingRoles(mapping, key as MappingKey, value as MappingOption),
    );
}

// Should return a Mapping type object
//
// () => Mapping
function getMapping(): Mapping {
    return {
        enableTeamCreation: {
            true: [
                {
                    roleName: 'system_user',
                    permission: MMPermission.CREATE_TEAM,
                    shouldHave: true,
                },
            ],
            false: [
                {
                    roleName: 'system_user',
                    permission: MMPermission.CREATE_TEAM,
                    shouldHave: false,
                },
            ],
        },

        editOthersPosts: {
            true: [
                {
                    roleName: 'system_admin',
                    permission: MMPermission.EDIT_OTHERS_POSTS,
                    shouldHave: true,
                },
                {
                    roleName: 'team_admin',
                    permission: MMPermission.EDIT_OTHERS_POSTS,
                    shouldHave: true,
                },
            ],
            false: [
                {
                    roleName: 'team_admin',
                    permission: MMPermission.EDIT_OTHERS_POSTS,
                    shouldHave: false,
                },
                {
                    roleName: 'system_admin',
                    permission: MMPermission.EDIT_OTHERS_POSTS,
                    shouldHave: true,
                },
            ],
        },

        enableOnlyAdminIntegrations: {
            true: [
                {
                    roleName: 'team_user',
                    permission: MMPermission.MANAGE_INCOMING_WEBHOOKS,
                    shouldHave: false,
                },
                {
                    roleName: 'team_user',
                    permission: MMPermission.MANAGE_OUTGOING_WEBHOOKS,
                    shouldHave: false,
                },
                {
                    roleName: 'team_user',
                    permission: MMPermission.MANAGE_SLASH_COMMANDS,
                    shouldHave: false,
                },
                {
                    roleName: 'system_user',
                    permission: MMPermission.MANAGE_OAUTH,
                    shouldHave: false,
                },
            ],
            false: [
                {
                    roleName: 'team_user',
                    permission: MMPermission.MANAGE_INCOMING_WEBHOOKS,
                    shouldHave: true,
                },
                {
                    roleName: 'team_user',
                    permission: MMPermission.MANAGE_OUTGOING_WEBHOOKS,
                    shouldHave: true,
                },
                {
                    roleName: 'team_user',
                    permission: MMPermission.MANAGE_SLASH_COMMANDS,
                    shouldHave: true,
                },
                {
                    roleName: 'system_user',
                    permission: MMPermission.MANAGE_OAUTH,
                    shouldHave: true,
                },
            ],
        },
    };
}

// Should return default Roles
//
// () => Roles
function getDefaultRoles(): Roles {
    const role: Role = {
        id: '',
        name: '',
        display_name: '',
        description: '',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        permissions: [],
        scheme_managed: false,
        built_in: false,
    };

    return {
        system_admin: role,
        system_user: role,
        team_admin: role,
        team_user: role,
    };
}

// Given Record<string, Role>, MappingRoleName list,
// if MappingRoleName is in MappingRoleName list,
// should merge the current role with the default role
//
// Record<string, Role> => MappingRoleName[] => Roles
function updateWithDefaultRoles(
    roles: Record<string, Role>,
    mappingRoleNames: MappingRoleName[],
): Roles {
    const defaultRoles = getDefaultRoles();

    return mappingRoleNames.reduce((acc, mappingRoleName) => {
        const role = roles[mappingRoleName];
        if (role) {
            const defaultRole = defaultRoles[mappingRoleName];
            const mergedRole = {...defaultRole, ...role};
            return {...acc, [mappingRoleName]: mergedRole};
        }
        return {...acc, [mappingRoleName]: defaultRoles[mappingRoleName]};
    }, defaultRoles);
}

// Given unknown policies, unknown roles,
// ckeck that roles and policies are valid.If yes should
// return a new Roles with the updated permissions for each role
//
// unnown => unknown =>  Roles
function getUpdatedRoles(
    policies: unknown = {},
    roles: Record<string, Role> = {},
): Roles {
    if (!isValidPermissions(Permissions)) {
        return getDefaultRoles();
    }

    const decodedPolicies = decodePolicies(policies);
    const checkedPolicies = checkPolicies(decodedPolicies);

    if (Object.keys(checkedPolicies).length === 0) {
        return getDefaultRoles();
    }

    const mappingRoles = getPolicyMappingRoles(checkedPolicies, getMapping());

    const mappingRoleNames = mappingRoles.reduce(
        (acc, {roleName}) => {
            return (acc.includes(roleName) ? acc : [...acc, roleName]);
        }, [] as MappingRoleName[]);

    const updatedWithDefaultRoles = updateWithDefaultRoles(
        roles,
        mappingRoleNames,
    );

    return addOrRemovePermissions(mappingRoles, updatedWithDefaultRoles);
}

// Given unknown policies object, and Record<string,Role>,
// should the return the updated part of the roles object
//
// unnown => unknown => Record<string, Role>
export function rolesFromMapping(
    policies: unknown = {},
    roles: Record<string, Role> = {},
): Record<string, Role> {
    const updatedRoles: Roles = getUpdatedRoles(policies, roles);
    return Object.entries(updatedRoles).reduce((acc, [key, value]) => {
        if (value.name !== '') {
            return {...acc, [key]: value};
        }
        return acc;
    }, {});
}

// Mappings values from Role
// -------------------------

// Given MappingKey, Roles, should
// get the mapping value that matches for a given set of roles
//
// if matches for 'true' should return 'true'
// if matches for 'false' should return 'false'
// if not matches should print a warning and return ''
//
// MappingKey => Record<string, Role> => string
export function mappingValueFromRoles(
    mappingKey: MappingKey,
    roles: Record<string, Role>,
): string {
    const mapping = getMapping();
    const mappingRolesTrue = getMappingRoles(mapping, mappingKey, 'true');
    const mappingRolesFalse = getMappingRoles(mapping, mappingKey, 'false');

    let value = '';

    ['true', 'false'].forEach((v) => {
        const mappingRoles = v === 'true' ? mappingRolesTrue : mappingRolesFalse;

        mappingRoles.forEach((mappingRole) => {
            const {roleName, permission, shouldHave} = mappingRole;
            const role = roles[roleName];

            if (role) {
                const hasPermission = role.permissions.includes(permission);
                const conditionTrue = shouldHave && hasPermission;
                const conditionFalse = !shouldHave && !hasPermission;

                switch (true) {
                case conditionTrue:
                    value = 'true';
                    break;
                case conditionFalse:
                    value = 'false';
                    break;
                }
            }
        });
    });

    if (value === '') {
        console.warn( // eslint-disable-line no-console
            `Warning: No matching mapping value found for key '${mappingKey}' with the given roles.`,
        );
    }

    return value;
}
