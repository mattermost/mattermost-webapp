// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import deepFreezeAndThrowOnMutation from 'mattermost-redux/utils/deep_freeze';
import TestHelper from 'mattermost-redux/test/test_helper';
import * as Selectors from 'mattermost-redux/selectors/entities/roles';
import {General, Permissions} from 'mattermost-redux/constants';
import {getMySystemPermissions, getMySystemRoles, getRoles} from 'mattermost-redux/selectors/entities/roles_helpers';

describe('Selectors.Roles', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();
    const team3 = TestHelper.fakeTeamWithId();
    const myTeamMembers = {};
    myTeamMembers[team1.id] = {roles: 'test_team1_role1 test_team1_role2'};
    myTeamMembers[team2.id] = {roles: 'test_team2_role1 test_team2_role2'};
    myTeamMembers[team3.id] = {};

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    channel1.display_name = 'Channel Name';

    const channel2 = TestHelper.fakeChannelWithId(team1.id);
    channel2.display_name = 'DEF';

    const channel3 = TestHelper.fakeChannelWithId(team2.id);

    const channel4 = TestHelper.fakeChannelWithId('');
    channel4.display_name = 'Channel 4';

    const channel5 = TestHelper.fakeChannelWithId(team1.id);
    channel5.type = General.PRIVATE_CHANNEL;
    channel5.display_name = 'Channel 5';

    const channel6 = TestHelper.fakeChannelWithId(team1.id);
    const channel7 = TestHelper.fakeChannelWithId('');
    channel7.display_name = '';
    channel7.type = General.GM_CHANNEL;

    const channel8 = TestHelper.fakeChannelWithId(team1.id);
    channel8.display_name = 'ABC';

    const channel9 = TestHelper.fakeChannelWithId(team1.id);
    const channel10 = TestHelper.fakeChannelWithId(team1.id);
    const channel11 = TestHelper.fakeChannelWithId(team1.id);
    channel11.type = General.PRIVATE_CHANNEL;
    const channel12 = TestHelper.fakeChannelWithId(team1.id);

    const channels = {};
    channels[channel1.id] = channel1;
    channels[channel2.id] = channel2;
    channels[channel3.id] = channel3;
    channels[channel4.id] = channel4;
    channels[channel5.id] = channel5;
    channels[channel6.id] = channel6;
    channels[channel7.id] = channel7;
    channels[channel8.id] = channel8;
    channels[channel9.id] = channel9;
    channels[channel10.id] = channel10;
    channels[channel11.id] = channel11;
    channels[channel12.id] = channel12;

    const channelsInTeam = {};
    channelsInTeam[team1.id] = [channel1.id, channel2.id, channel5.id, channel6.id, channel8.id, channel10.id, channel11.id];
    channelsInTeam[team2.id] = [channel3.id];
    channelsInTeam[''] = [channel4.id, channel7.id, channel9.id];

    const user = TestHelper.fakeUserWithId();
    const profiles = {};
    profiles[user.id] = user;
    profiles[user.id].roles = 'test_user_role test_user_role2';

    const channelsRoles = {};
    channelsRoles[channel1.id] = new Set(['test_channel_a_role1', 'test_channel_a_role2']);
    channelsRoles[channel2.id] = new Set(['test_channel_a_role1', 'test_channel_a_role2']);
    channelsRoles[channel3.id] = new Set(['test_channel_a_role1', 'test_channel_a_role2']);
    channelsRoles[channel4.id] = new Set(['test_channel_a_role1', 'test_channel_a_role2']);
    channelsRoles[channel5.id] = new Set(['test_channel_a_role1', 'test_channel_a_role2']);
    channelsRoles[channel7.id] = new Set(['test_channel_b_role1', 'test_channel_b_role2']);
    channelsRoles[channel8.id] = new Set(['test_channel_b_role1', 'test_channel_b_role2']);
    channelsRoles[channel9.id] = new Set(['test_channel_b_role1', 'test_channel_b_role2']);
    channelsRoles[channel10.id] = new Set(['test_channel_c_role1', 'test_channel_c_role2']);
    channelsRoles[channel11.id] = new Set(['test_channel_c_role1', 'test_channel_c_role2']);
    const roles = {
        test_team1_role1: {permissions: ['team1_role1']},
        test_team2_role1: {permissions: ['team2_role1']},
        test_team2_role2: {permissions: ['team2_role2']},
        test_channel_a_role1: {permissions: ['channel_a_role1']},
        test_channel_a_role2: {permissions: ['channel_a_role2']},
        test_channel_b_role2: {permissions: ['channel_b_role2']},
        test_channel_c_role1: {permissions: ['channel_c_role1']},
        test_channel_c_role2: {permissions: ['channel_c_role2']},
        test_user_role2: {permissions: ['user_role2', Permissions.EDIT_CUSTOM_GROUP, Permissions.CREATE_CUSTOM_GROUP, Permissions.MANAGE_CUSTOM_GROUP_MEMBERS, Permissions.DELETE_CUSTOM_GROUP]},
        custom_group_user: {permissions: ['custom_group_user']},
    };

    const group1 = TestHelper.fakeGroup('group1', 'custom');
    const group2 = TestHelper.fakeGroup('group2', 'custom');
    const group3 = TestHelper.fakeGroup('group3', 'custom');
    const group4 = TestHelper.fakeGroup('group4', 'custom');
    const group5 = TestHelper.fakeGroup('group5');

    const groups = {};
    groups.group1 = group1;
    groups.group2 = group2;
    groups.group3 = group3;
    groups.group4 = group4;
    groups.group5 = group5;

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            users: {
                currentUserId: user.id,
                profiles,
            },
            teams: {
                currentTeamId: team1.id,
                myMembers: myTeamMembers,
            },
            channels: {
                currentChannelId: channel1.id,
                channels,
                roles: channelsRoles,
            },
            groups: {
                groups,
                myGroups: ['group1'],
            },
            roles: {
                roles,
            },
        },
    });

    it('should return my roles by scope on getMySystemRoles/getMyTeamRoles/getMyChannelRoles/getMyGroupRoles', () => {
        const teamsRoles = {};
        teamsRoles[team1.id] = new Set(['test_team1_role1', 'test_team1_role2']);
        teamsRoles[team2.id] = new Set(['test_team2_role1', 'test_team2_role2']);

        const groupRoles = {};
        groupRoles[group1.id] = new Set(['custom_group_user']);

        const myRoles = {
            system: new Set(['test_user_role', 'test_user_role2']),
            team: teamsRoles,
            channel: channelsRoles,
        };
        assert.deepEqual(getMySystemRoles(testState), myRoles.system);
        assert.deepEqual(Selectors.getMyTeamRoles(testState), myRoles.team);
        assert.deepEqual(Selectors.getMyChannelRoles(testState), myRoles.channel);
        assert.deepEqual(Selectors.getMyGroupRoles(testState), groupRoles);
    });

    it('should return current loaded roles on getRoles', () => {
        const loadedRoles = {
            test_team1_role1: {permissions: ['team1_role1']},
            test_team2_role1: {permissions: ['team2_role1']},
            test_team2_role2: {permissions: ['team2_role2']},
            test_channel_a_role1: {permissions: ['channel_a_role1']},
            test_channel_a_role2: {permissions: ['channel_a_role2']},
            test_channel_b_role2: {permissions: ['channel_b_role2']},
            test_channel_c_role1: {permissions: ['channel_c_role1']},
            test_channel_c_role2: {permissions: ['channel_c_role2']},
            test_user_role2: {permissions: ['user_role2', Permissions.EDIT_CUSTOM_GROUP, Permissions.CREATE_CUSTOM_GROUP, Permissions.MANAGE_CUSTOM_GROUP_MEMBERS, Permissions.DELETE_CUSTOM_GROUP]},
            custom_group_user: {permissions: ['custom_group_user']},
        };
        assert.deepEqual(getRoles(testState), loadedRoles);
    });

    it('should return my system permission on getMySystemPermissions', () => {
        assert.deepEqual(getMySystemPermissions(testState), new Set([
            'user_role2', Permissions.EDIT_CUSTOM_GROUP, Permissions.CREATE_CUSTOM_GROUP, Permissions.MANAGE_CUSTOM_GROUP_MEMBERS, Permissions.DELETE_CUSTOM_GROUP,
        ]));
    });

    it('should return if i have a system permission on haveISystemPermission', () => {
        assert.equal(Selectors.haveISystemPermission(testState, {permission: 'user_role2'}), true);
        assert.equal(Selectors.haveISystemPermission(testState, {permission: 'invalid_permission'}), false);
    });

    it('should return if i have a team permission on haveITeamPermission', () => {
        assert.equal(Selectors.haveITeamPermission(testState, team1.id, 'user_role2'), true);
        assert.equal(Selectors.haveITeamPermission(testState, team1.id, 'team1_role1'), true);
        assert.equal(Selectors.haveITeamPermission(testState, team1.id, 'team2_role2'), false);
        assert.equal(Selectors.haveITeamPermission(testState, team1.id, 'invalid_permission'), false);
    });

    it('should return if i have a team permission on haveICurrentTeamPermission', () => {
        assert.equal(Selectors.haveICurrentTeamPermission(testState, 'user_role2'), true);
        assert.equal(Selectors.haveICurrentTeamPermission(testState, 'team1_role1'), true);
        assert.equal(Selectors.haveICurrentTeamPermission(testState, 'team2_role2'), false);
        assert.equal(Selectors.haveICurrentTeamPermission(testState, 'invalid_permission'), false);
    });

    it('should return if i have a channel permission on haveIChannelPermission', () => {
        assert.equal(Selectors.haveIChannelPermission(testState, team1.id, channel1.id, 'user_role2'), true);
        assert.equal(Selectors.haveIChannelPermission(testState, team1.id, channel1.id, 'team1_role1'), true);
        assert.equal(Selectors.haveIChannelPermission(testState, team1.id, channel1.id, 'team2_role2'), false);
        assert.equal(Selectors.haveIChannelPermission(testState, team1.id, channel1.id, 'channel_a_role1'), true);
        assert.equal(Selectors.haveIChannelPermission(testState, team1.id, channel1.id, 'channel_b_role1'), false);
    });

    it('should return if i have a channel permission on haveICurrentChannelPermission', () => {
        assert.equal(Selectors.haveICurrentChannelPermission(testState, 'user_role2'), true);
        assert.equal(Selectors.haveICurrentChannelPermission(testState, 'team1_role1'), true);
        assert.equal(Selectors.haveICurrentChannelPermission(testState, 'team2_role2'), false);
        assert.equal(Selectors.haveICurrentChannelPermission(testState, 'channel_a_role1'), true);
        assert.equal(Selectors.haveICurrentChannelPermission(testState, 'channel_b_role1'), false);
    });

    it('should return group memberships on getGroupMemberships', () => {
        assert.deepEqual(Selectors.getGroupMemberships(testState), {[group1.id]: {user_id: user.id, roles: 'custom_group_user'}});
    });

    it('should return if i have a group permission on haveIGroupPermission', () => {
        assert.equal(Selectors.haveIGroupPermission(testState, group1.id, Permissions.EDIT_CUSTOM_GROUP), true);
        assert.equal(Selectors.haveIGroupPermission(testState, group1.id, Permissions.CREATE_CUSTOM_GROUP), true);
        assert.equal(Selectors.haveIGroupPermission(testState, group1.id, Permissions.MANAGE_CUSTOM_GROUP_MEMBERS), true);
        assert.equal(Selectors.haveIGroupPermission(testState, group1.id, Permissions.DELETE_CUSTOM_GROUP), true);

        // You don't have to be a member to perform these actions
        assert.equal(Selectors.haveIGroupPermission(testState, group2.id, Permissions.EDIT_CUSTOM_GROUP), true);
        assert.equal(Selectors.haveIGroupPermission(testState, group2.id, Permissions.CREATE_CUSTOM_GROUP), true);
        assert.equal(Selectors.haveIGroupPermission(testState, group2.id, Permissions.MANAGE_CUSTOM_GROUP_MEMBERS), true);
        assert.equal(Selectors.haveIGroupPermission(testState, group2.id, Permissions.DELETE_CUSTOM_GROUP), true);
    });

    it('should return group set with permissions on getGroupListPermissions', () => {
        assert.deepEqual(Selectors.getGroupListPermissions(testState), {
            [group1.id]: {can_delete: true, can_manage_members: true},
            [group2.id]: {can_delete: true, can_manage_members: true},
            [group3.id]: {can_delete: true, can_manage_members: true},
            [group4.id]: {can_delete: true, can_manage_members: true},
            [group5.id]: {can_delete: false, can_manage_members: false},
        });
    });
});
