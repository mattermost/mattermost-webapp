// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import deepFreezeAndThrowOnMutation from 'mattermost-redux/utils/deep_freeze';
import * as Selectors from 'mattermost-redux/selectors/entities/groups';
import TestHelper from 'mattermost-redux/test/test_helper';

describe('Selectors.Groups', () => {
    const teamID = 'c6ubwm63apgftbjs71enbjjpsh';
    const expectedAssociatedGroupID1 = 'xh585kyz3tn55q6ipfo57btwnc';
    const expectedAssociatedGroupID2 = 'emdwu98u6jg9xfn9p5zu48bojo';
    const teamAssociatedGroupIDs = [expectedAssociatedGroupID1, expectedAssociatedGroupID2];

    const channelID = 'c6ubwm63apgftbjs71enbjjpzz';
    const expectedAssociatedGroupID3 = 'xos794c6tfb57eog481acokozc';
    const expectedAssociatedGroupID4 = 'tnd8zod9f3fdtqosxjmhwucbth';
    const channelAssociatedGroupIDs = [expectedAssociatedGroupID3, expectedAssociatedGroupID4];
    const group1 = {
        id: expectedAssociatedGroupID1,
        name: '9uobsi3xb3y5tfjb3ze7umnh1o',
        display_name: 'abc',
        description: '',
        source: 'ldap',
        remote_id: 'abc',
        create_at: 1553808969975,
        update_at: 1553808969975,
        delete_at: 0,
        has_syncables: false,
        member_count: 2,
        allow_reference: true,
    };
    const group2 = {
        id: expectedAssociatedGroupID2,
        name: '7ybu9oy77jgedqp4pph8f4j5ge',
        display_name: 'xyz',
        description: '',
        source: 'ldap',
        remote_id: 'xyz',
        create_at: 1553808972099,
        update_at: 1553808972099,
        delete_at: 0,
        has_syncables: false,
        member_count: 2,
        allow_reference: false,
    };
    const group3 = {
        id: expectedAssociatedGroupID3,
        name: '5mte953ncbfpunpr3zmtopiwbo',
        display_name: 'developers',
        description: '',
        source: 'ldap',
        remote_id: 'developers',
        create_at: 1553808970570,
        update_at: 1553808970570,
        delete_at: 0,
        has_syncables: false,
        member_count: 5,
        allow_reference: false,
    };
    const group4 = {
        id: [expectedAssociatedGroupID4],
        name: 'nobctj4brfgtpj3a1peiyq47tc',
        display_name: 'engineering',
        description: '',
        source: 'ldap',
        create_at: 1553808971099,
        remote_id: 'engineering',
        update_at: 1553808971099,
        delete_at: 0,
        has_syncables: false,
        member_count: 8,
        allow_reference: true,
    };
    const user1 = TestHelper.fakeUserWithId();
    const user2 = TestHelper.fakeUserWithId();
    const user3 = TestHelper.fakeUserWithId();

    const profiles = {};
    profiles[user1.id] = user1;
    profiles[user2.id] = user2;
    profiles[user3.id] = user3;

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            groups: {
                syncables: {},
                members: {},
                groups: {
                    [expectedAssociatedGroupID1]: group1,
                    [expectedAssociatedGroupID3]: group3,
                    [expectedAssociatedGroupID4]: group4,
                    [expectedAssociatedGroupID2]: group2,
                },
                myGroups: {
                    [expectedAssociatedGroupID1]: group1,
                    [expectedAssociatedGroupID4]: group4,
                    [expectedAssociatedGroupID2]: group2,
                },
            },
            teams: {
                teams: {
                    [teamID]: {group_constrained: false},
                },
                groupsAssociatedToTeam: {
                    [teamID]: {ids: teamAssociatedGroupIDs},
                },
            },
            channels: {
                channels: {
                    [channelID]: {team_id: teamID, id: channelID},
                },
                groupsAssociatedToChannel: {
                    [channelID]: {ids: channelAssociatedGroupIDs},
                },
            },
            general: {
                config: {},
            },
            preferences: {
                myPreferences: {},
            },
            users: {
                currentUserId: user1.id,
                profiles,
            },
        },
    });

    it('getAssociatedGroupsByName', () => {
        const groupsByName = Selectors.getAssociatedGroupsByName(testState, teamID, channelID);
        assert.equal(groupsByName[group1.name], group1);
        assert.equal(groupsByName[group4.name], group4);
        assert.equal(Object.keys(groupsByName).length, 2);
    });

    it('getGroupsAssociatedToTeam', () => {
        const expected = [
            group1,
            group2,
        ];
        assert.deepEqual(Selectors.getGroupsAssociatedToTeam(testState, teamID), expected);
    });

    it('getGroupsNotAssociatedToTeam', () => {
        const expected = Object.entries(testState.entities.groups.groups).filter(([groupID]) => !teamAssociatedGroupIDs.includes(groupID)).map(([, group]) => group);
        assert.deepEqual(Selectors.getGroupsNotAssociatedToTeam(testState, teamID), expected);
    });

    it('getGroupsAssociatedToChannel', () => {
        const expected = [
            group3,
            group4,
        ];
        assert.deepEqual(Selectors.getGroupsAssociatedToChannel(testState, channelID), expected);
    });

    it('getGroupsNotAssociatedToChannel', () => {
        let expected = Object.values(testState.entities.groups.groups).filter((group) => !channelAssociatedGroupIDs.includes(group.id));
        assert.deepEqual(Selectors.getGroupsNotAssociatedToChannel(testState, channelID, teamID), expected);

        let cloneState = JSON.parse(JSON.stringify(testState));
        cloneState.entities.teams.teams[teamID].group_constrained = true;
        cloneState.entities.teams.groupsAssociatedToTeam[teamID].ids = [expectedAssociatedGroupID1];
        cloneState = deepFreezeAndThrowOnMutation(cloneState);

        expected = Object.values(cloneState.entities.groups.groups).filter((group) => !channelAssociatedGroupIDs.includes(group.id) && cloneState.entities.teams.groupsAssociatedToTeam[teamID].ids.includes(group.id));
        assert.deepEqual(Selectors.getGroupsNotAssociatedToChannel(cloneState, channelID, teamID), expected);
    });

    it('getGroupsAssociatedToTeamForReference', () => {
        const expected = [
            group1,
        ];
        assert.deepEqual(Selectors.getGroupsAssociatedToTeamForReference(testState, teamID), expected);
    });

    it('getGroupsAssociatedToChannelForReference', () => {
        const expected = [
            group4,
        ];
        assert.deepEqual(Selectors.getGroupsAssociatedToChannelForReference(testState, channelID), expected);
    });

    it('getAllAssociatedGroupsForReference', () => {
        const expected = [
            group1,
            group4,
        ];
        assert.deepEqual(Selectors.getAllAssociatedGroupsForReference(testState), expected);
    });

    it('getMyGroupMentionKeys', () => {
        const expected = [
            {
                key: `@${group1.name}`,
            },
            {
                key: `@${group4.name}`,
            },
        ];
        assert.deepEqual(Selectors.getMyGroupMentionKeys(testState), expected);
    });

    it('getMyGroupMentionKeysForChannel', () => {
        const expected = [
            {
                key: `@${group1.name}`,
            },
            {
                key: `@${group4.name}`,
            },
        ];
        assert.deepEqual(Selectors.getMyGroupMentionKeysForChannel(testState, teamID, channelID), expected);
    });
});
