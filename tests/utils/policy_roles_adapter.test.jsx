// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Permissions} from 'mattermost-redux/constants/index';

import {rolesFromMapping, mappingValueFromRoles} from 'utils/policy_roles_adapter';

describe('PolicyRolesAdapter', function() {
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

    describe('PolicyRolesAdapter.rolesFromMapping', function() {
        test('unknown value throws an exception', function() {
            policies.restrictTeamInvite = 'sometimesmaybe';
            expect(() => {
                rolesFromMapping(policies, roles);
            }).toThrowError(/not present in mapping/i);
        });

        // // That way you can pass in the whole state if you want.
        test('ignores unknown keys', function() {
            policies.blah = 'all';
            expect(() => {
                rolesFromMapping(policies, roles);
            }).not.toThrowError();
        });

        test('mock data setup', function() {
            const updatedRoles = rolesFromMapping(policies, roles);
            expect(Object.values(updatedRoles).length).toEqual(0);
        });

        describe('teamPolicies', function() {
            test('all', function() {
                roles.team_user.permissions = [];
                const updatedRoles = rolesFromMapping({restrictTeamInvite: 'all'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(1);
                expect(updatedRoles.team_user.permissions).toEqual(expect.arrayContaining([Permissions.INVITE_USER, Permissions.ADD_USER_TO_TEAM]));
            });

            test('team_admin', function() {
                const updatedRoles = rolesFromMapping({restrictTeamInvite: 'team_admin'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(2);
                expect(updatedRoles.team_user.permissions).not.toEqual(expect.arrayContaining([Permissions.INVITE_USER, Permissions.ADD_USER_TO_TEAM]));
                expect(updatedRoles.team_admin.permissions).toEqual(expect.arrayContaining([Permissions.INVITE_USER, Permissions.ADD_USER_TO_TEAM]));
            });

            test('system_admin', function() {
                roles.team_admin.permissions.push(Permissions.INVITE_USER);
                const updatedRoles = rolesFromMapping({restrictTeamInvite: 'system_admin'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(2);
                expect(updatedRoles.team_user.permissions).not.toEqual(expect.arrayContaining([Permissions.INVITE_USER, Permissions.ADD_USER_TO_TEAM]));
                expect(updatedRoles.team_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.INVITE_USER, Permissions.ADD_USER_TO_TEAM]));
            });
        });

        describe('channelTeamMixedPolicies', function() {
            test('all', function() {
                roles.team_user.permissions = [];
                const updatedRoles = rolesFromMapping({restrictPublicChannelManagement: 'all'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(1);
                expect(updatedRoles.team_user.permissions).toEqual(expect.arrayContaining([Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]));
            });

            test('channel_admin', function() {
                const updatedRoles = rolesFromMapping({restrictPublicChannelManagement: 'channel_admin'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(3);
                expect(updatedRoles.team_user.permissions).not.toEqual(expect.arrayContaining([Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]));
                expect(updatedRoles.channel_admin.permissions).toEqual(expect.arrayContaining([Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]));
                expect(updatedRoles.team_admin.permissions).toEqual(expect.arrayContaining([Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]));
            });

            test('team_admin', function() {
                const updatedRoles = rolesFromMapping({restrictPublicChannelManagement: 'team_admin'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(2);
                expect(updatedRoles.team_user.permissions).not.toEqual(expect.arrayContaining([Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]));
                expect(updatedRoles.team_admin.permissions).toEqual(expect.arrayContaining([Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]));
            });

            test('system_admin', function() {
                roles.team_admin.permissions.push(Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES);
                const updatedRoles = rolesFromMapping({restrictPublicChannelManagement: 'system_admin'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(2);
                expect(updatedRoles.team_user.permissions).not.toEqual(expect.arrayContaining([Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]));
                expect(updatedRoles.team_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.MANAGE_PUBLIC_CHANNEL_PROPERTIES]));
            });
        });

        describe('channelPolicies', function() {
            test('all', function() {
                roles.channel_user.permissions = [];
                const updatedRoles = rolesFromMapping({restrictPrivateChannelManageMembers: 'all'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(1);
                expect(updatedRoles.channel_user.permissions).toEqual(expect.arrayContaining([Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS]));
            });

            test('channel_admin', function() {
                const updatedRoles = rolesFromMapping({restrictPrivateChannelManageMembers: 'channel_admin'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(3);
                expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS]));
                expect(updatedRoles.channel_admin.permissions).toEqual(expect.arrayContaining([Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS]));
                expect(updatedRoles.team_admin.permissions).toEqual(expect.arrayContaining([Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS]));
            });

            test('team_admin', function() {
                const updatedRoles = rolesFromMapping({restrictPrivateChannelManageMembers: 'team_admin'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(2);
                expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS]));
                expect(updatedRoles.team_admin.permissions).toEqual(expect.arrayContaining([Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS]));
            });

            test('system_admin', function() {
                roles.team_admin.permissions.push(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS);
                const updatedRoles = rolesFromMapping({restrictPrivateChannelManageMembers: 'system_admin'}, roles);
                expect(Object.values(updatedRoles).length).toEqual(2);
                expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS]));
                expect(updatedRoles.team_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS]));
            });
        });

        test('restrictPostDelete updates expected permissions', function() {
            policies.restrictPostDelete = 'team_admin';
            let updatedRoles = rolesFromMapping(policies, roles);
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            policies.restrictPostDelete = 'system_admin';
            updatedRoles = rolesFromMapping(policies, roles);
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));

            expect(updatedRoles.team_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_POST]));
            expect(updatedRoles.team_admin.permissions).not.toEqual(expect.arrayContaining([Permissions.DELETE_OTHERS_POSTS]));
        });

        test('allowEditPost updates expected permissions', function() {
            policies.allowEditPost = 'never';
            const updatedRoles = rolesFromMapping(policies, roles);
            expect(updatedRoles.channel_user.permissions).not.toEqual(expect.arrayContaining([Permissions.EDIT_POST]));
        });

        test('it only returns the updated roles', function() {
            const updatedRoles = rolesFromMapping(policies, roles);
            expect(Object.keys(updatedRoles).length).toEqual(0);
        });
    });

    describe('PolicyRolesAdapter.mappingValueFromRoles', function() {
        describe('team-based', function() {
            test('returns the expected policy value for a team-based policy', function() {
                addPermissionToRole(Permissions.INVITE_USER, roles.team_user);
                addPermissionToRole(Permissions.ADD_USER_TO_TEAM, roles.team_user);
                let value = mappingValueFromRoles('restrictTeamInvite', roles);
                expect(value).toEqual('all');

                removePermissionFromRole(Permissions.INVITE_USER, roles.team_user);
                removePermissionFromRole(Permissions.ADD_USER_TO_TEAM, roles.team_user);
                addPermissionToRole(Permissions.INVITE_USER, roles.team_admin);
                addPermissionToRole(Permissions.ADD_USER_TO_TEAM, roles.team_admin);
                value = mappingValueFromRoles('restrictTeamInvite', roles);
                expect(value).toEqual('team_admin');

                removePermissionFromRole(Permissions.INVITE_USER, roles.team_user);
                removePermissionFromRole(Permissions.ADD_USER_TO_TEAM, roles.team_user);
                removePermissionFromRole(Permissions.INVITE_USER, roles.team_admin);
                removePermissionFromRole(Permissions.ADD_USER_TO_TEAM, roles.team_admin);
                value = mappingValueFromRoles('restrictTeamInvite', roles);
                expect(value).toEqual('system_admin');
            });
        });

        describe('channel-team-mixed-based', function() {
            test('returns the expected policy value for a channel/team mixed based policy', function() {
                addPermissionToRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.team_user);
                let value = mappingValueFromRoles('restrictPublicChannelDeletion', roles);
                expect(value).toEqual('all');

                removePermissionFromRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.team_user);
                addPermissionToRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.channel_admin);
                addPermissionToRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.team_admin);
                value = mappingValueFromRoles('restrictPublicChannelDeletion', roles);
                expect(value).toEqual('channel_admin');

                removePermissionFromRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.team_user);
                removePermissionFromRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.channel_admin);
                addPermissionToRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.team_admin);
                value = mappingValueFromRoles('restrictPublicChannelDeletion', roles);
                expect(value).toEqual('team_admin');

                removePermissionFromRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.team_user);
                removePermissionFromRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.channel_admin);
                removePermissionFromRole(Permissions.DELETE_PUBLIC_CHANNEL, roles.team_admin);
                value = mappingValueFromRoles('restrictPublicChannelDeletion', roles);
                expect(value).toEqual('system_admin');
            });
        });

        describe('channel-based', function() {
            test('returns the expected policy value for a channel-based policy', function() {
                addPermissionToRole(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS, roles.channel_user);
                let value = mappingValueFromRoles('restrictPrivateChannelManageMembers', roles);
                expect(value).toEqual('all');

                removePermissionFromRole(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS, roles.channel_user);
                addPermissionToRole(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS, roles.channel_admin);
                addPermissionToRole(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS, roles.team_admin);
                value = mappingValueFromRoles('restrictPrivateChannelManageMembers', roles);
                expect(value).toEqual('channel_admin');

                removePermissionFromRole(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS, roles.channel_user);
                removePermissionFromRole(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS, roles.channel_admin);
                addPermissionToRole(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS, roles.team_admin);
                value = mappingValueFromRoles('restrictPrivateChannelManageMembers', roles);
                expect(value).toEqual('team_admin');

                removePermissionFromRole(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS, roles.channel_user);
                removePermissionFromRole(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS, roles.channel_admin);
                removePermissionFromRole(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS, roles.team_admin);
                value = mappingValueFromRoles('restrictPrivateChannelManageMembers', roles);
                expect(value).toEqual('system_admin');
            });
        });

        describe('allowEditPost', function() {
            test('returns the expected policy value for a team-based policy', function() {
                addPermissionToRole(Permissions.EDIT_POST, roles.channel_user);
                addPermissionToRole(Permissions.EDIT_POST, roles.system_admin);
                let value = mappingValueFromRoles('allowEditPost', roles);
                expect(value).toEqual('always');

                removePermissionFromRole(Permissions.EDIT_POST, roles.channel_user);
                removePermissionFromRole(Permissions.EDIT_POST, roles.system_admin);
                value = mappingValueFromRoles('allowEditPost', roles);
                expect(value).toEqual('never');
            });
        });

        describe('restrictPostDelete', function() {
            test('returns the expected policy value for a team-based policy', function() {
                addPermissionToRole(Permissions.DELETE_POST, roles.channel_user);
                removePermissionFromRole(Permissions.DELETE_POST, roles.channel_admin);
                removePermissionFromRole(Permissions.DELETE_OTHERS_POSTS, roles.channel_admin);
                addPermissionToRole(Permissions.DELETE_POST, roles.team_admin);
                addPermissionToRole(Permissions.DELETE_OTHERS_POSTS, roles.team_admin);
                let value = mappingValueFromRoles('restrictPostDelete', roles);
                expect(value).toEqual('all');

                removePermissionFromRole(Permissions.DELETE_POST, roles.channel_user);
                removePermissionFromRole(Permissions.DELETE_POST, roles.channel_admin);
                removePermissionFromRole(Permissions.DELETE_OTHERS_POSTS, roles.channel_admin);
                addPermissionToRole(Permissions.DELETE_POST, roles.team_admin);
                addPermissionToRole(Permissions.DELETE_OTHERS_POSTS, roles.team_admin);
                value = mappingValueFromRoles('restrictPostDelete', roles);
                expect(value).toEqual('team_admin');

                removePermissionFromRole(Permissions.DELETE_POST, roles.channel_user);
                removePermissionFromRole(Permissions.DELETE_POST, roles.channel_admin);
                removePermissionFromRole(Permissions.DELETE_OTHERS_POSTS, roles.channel_admin);
                removePermissionFromRole(Permissions.DELETE_POST, roles.team_admin);
                removePermissionFromRole(Permissions.DELETE_OTHERS_POSTS, roles.team_admin);
                value = mappingValueFromRoles('restrictPostDelete', roles);
                expect(value).toEqual('system_admin');
            });
        });

        test('unmet roles condtion throws an exception', function() {
            addPermissionToRole(Permissions.DELETE_POST, roles.channel_user);
            addPermissionToRole(Permissions.DELETE_POST, roles.channel_admin);
            addPermissionToRole(Permissions.DELETE_OTHERS_POSTS, roles.channel_admin);
            removePermissionFromRole(Permissions.DELETE_POST, roles.team_admin);
            removePermissionFromRole(Permissions.DELETE_OTHERS_POSTS, roles.team_admin);
            expect(() => {
                mappingValueFromRoles('restrictPostDelete', roles);
            }).toThrowError(/no matching mapping value/i);
        });

        test('ignores unknown keys', function() {
            policies.blah = 'all';
            expect(() => {
                mappingValueFromRoles('nonExistent', roles);
            }).toThrowError(/no matching mapping value/i);
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
