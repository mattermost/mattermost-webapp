// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Permissions} from 'mattermost-redux/constants/index';

import {rolesFromMapping, mappingValueFromRoles} from 'utils/policy_roles_adapter';

describe('PolicyRolesAdapter', () => {
    let roles = {};
    let policies = {};

    beforeEach(() => {
        roles = {
            channel_user: {
                name: 'channel_user',
                permissions: [
                    Permissions.EDIT_POST,
                    Permissions.DELETE_POST,
                    Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS,
                ],
            },
            team_user: {
                name: 'team_user',
                permissions: [
                    Permissions.INVITE_USER,
                    Permissions.ADD_USER_TO_TEAM,
                    Permissions.CREATE_PUBLIC_CHANNEL,
                    Permissions.CREATE_PRIVATE_CHANNEL,
                    Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES,
                    Permissions.DELETE_PUBLIC_CHANNEL,
                    Permissions.MANAGE_PRIVATE_CHANNEL_PROPERTIES,
                    Permissions.DELETE_PRIVATE_CHANNEL,
                ],
            },
            channel_admin: {
                name: 'channel_admin',
                permissions: [
                    Permissions.MANAGE_CHANNEL_ROLES,
                ],
            },
            team_admin: {
                name: 'team_admin',
                permissions: [
                    Permissions.DELETE_POST,
                    Permissions.DELETE_OTHERS_POSTS,
                ],
            },
            system_admin: {
                name: 'system_admin',
                permissions: [
                    Permissions.DELETE_PUBLIC_CHANNEL,
                    Permissions.INVITE_USER,
                    Permissions.ADD_USER_TO_TEAM,
                    Permissions.DELETE_POST,
                    Permissions.DELETE_OTHERS_POSTS,
                    Permissions.EDIT_POST,
                ],
            },
            system_user: {
                name: 'system_user',
                permissions: [
                    Permissions.CREATE_TEAM,
                ],
            },
        };
        const teamPolicies = {
            restrictTeamInvite: 'all',
            restrictPublicChannelCreation: 'all',
            restrictPrivateChannelCreation: 'all',
        };
        const channelPolicies = {
            restrictPublicChannelManagement: 'all',
            restrictPublicChannelDeletion: 'all',
            restrictPrivateChannelManagement: 'all',
            restrictPrivateChannelManageMembers: 'all',
            restrictPrivateChannelDeletion: 'all',
        };
        const restrictPostDelete = 'all';
        const allowEditPost = 'always';
        policies = {
            ...teamPolicies,
            ...channelPolicies,
            restrictPostDelete,
            allowEditPost,
        };
    });

    afterEach(() => {
        roles = {};
    });

    describe('PolicyRolesAdapter.rolesFromMapping', () => {
        test('unknown value throws an exception', () => {
            policies.enableTeamCreation = 'sometimesmaybe';
            expect(() => {
                rolesFromMapping(policies, roles);
            }).toThrowError(/not present in mapping/i);
        });

        // // That way you can pass in the whole state if you want.
        test('ignores unknown keys', () => {
            policies.blah = 'all';
            expect(() => {
                rolesFromMapping(policies, roles);
            }).not.toThrowError();
        });

        test('mock data setup', () => {
            const updatedRoles = rolesFromMapping(policies, roles);
            expect(Object.values(updatedRoles).length).toEqual(0);
        });

        describe('enableTeamCreation', () => {
            test('true', () => {
                roles.system_user.permissions = [];
                const updatedRoles = rolesFromMapping({enableTeamCreation: 'true'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(1);
                expect(updatedRoles.system_user.permissions).toEqual(expect.arrayContaining([Permissions.CREATE_TEAM]));
            });

            test('false', () => {
                roles.system_user.permissions = [Permissions.CREATE_TEAM];
                const updatedRoles = rolesFromMapping({enableTeamCreation: 'false'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(1);
                expect(updatedRoles.system_user.permissions).not.toEqual(expect.arrayContaining([Permissions.CREATE_TEAM]));
            });
        });

        describe('enableOnlyAdminIntegrations', () => {
            test('true', () => {
                roles.system_user.permissions = [Permissions.MANAGE_OAUTH];
                roles.team_user.permissions = [Permissions.MANAGE_INCOMING_WEBHOOKS, Permissions.MANAGE_OUTGOING_WEBHOOKS, Permissions.MANAGE_SLASH_COMMANDS];
                const updatedRoles = rolesFromMapping({enableOnlyAdminIntegrations: 'true'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(2);
                expect(updatedRoles.system_user.permissions).not.toEqual(expect.arrayContaining([Permissions.MANAGE_OAUTH]));
                expect(updatedRoles.team_user.permissions).not.toEqual(expect.arrayContaining([Permissions.MANAGE_INCOMING_WEBHOOKS, Permissions.MANAGE_OUTGOING_WEBHOOKS, Permissions.MANAGE_SLASH_COMMANDS]));
            });

            test('false', () => {
                roles.system_user.permissions = [];
                roles.team_user.permissions = [];
                const updatedRoles = rolesFromMapping({enableOnlyAdminIntegrations: 'false'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(2);
                expect(updatedRoles.system_user.permissions).toEqual(expect.arrayContaining([Permissions.MANAGE_OAUTH]));
                expect(updatedRoles.team_user.permissions).toEqual(expect.arrayContaining([Permissions.MANAGE_INCOMING_WEBHOOKS, Permissions.MANAGE_OUTGOING_WEBHOOKS, Permissions.MANAGE_SLASH_COMMANDS]));
            });
        });

        test('it only returns the updated roles', () => {
            const updatedRoles = rolesFromMapping(policies, roles);
            expect(Object.keys(updatedRoles).length).toEqual(0);
        });
    });

    describe('PolicyRolesAdapter.mappingValueFromRoles', () => {
        describe('enableTeamCreation', () => {
            test('returns the expected policy value for a enableTeamCreation policy', () => {
                addPermissionToRole(Permissions.CREATE_TEAM, roles.system_user);
                let value = mappingValueFromRoles('enableTeamCreation', roles);
                expect(value).toEqual('true');

                removePermissionFromRole(Permissions.CREATE_TEAM, roles.system_user);
                value = mappingValueFromRoles('enableTeamCreation', roles);
                expect(value).toEqual('false');
            });
        });

        describe('enableOnlyAdminIntegrations', () => {
            test('returns the expected policy value for a enableOnlyAdminIntegrations policy', () => {
                addPermissionToRole(Permissions.MANAGE_INCOMING_WEBHOOKS, roles.team_user);
                addPermissionToRole(Permissions.MANAGE_OUTGOING_WEBHOOKS, roles.team_user);
                addPermissionToRole(Permissions.MANAGE_SLASH_COMMANDS, roles.team_user);
                addPermissionToRole(Permissions.MANAGE_OAUTH, roles.system_user);
                let value = mappingValueFromRoles('enableOnlyAdminIntegrations', roles);
                expect(value).toEqual('false');

                removePermissionFromRole(Permissions.MANAGE_INCOMING_WEBHOOKS, roles.team_user);
                removePermissionFromRole(Permissions.MANAGE_OUTGOING_WEBHOOKS, roles.team_user);
                removePermissionFromRole(Permissions.MANAGE_SLASH_COMMANDS, roles.team_user);
                removePermissionFromRole(Permissions.MANAGE_OAUTH, roles.system_user);
                value = mappingValueFromRoles('enableOnlyAdminIntegrations', roles);
                expect(value).toEqual('true');
            });
        });
    });
});

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
