// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {General, Preferences} from 'mattermost-redux/constants';
import * as Selectors from 'mattermost-redux/selectors/entities/users';
import TestHelper from 'mattermost-redux/test/test_helper';
import deepFreezeAndThrowOnMutation from 'mattermost-redux/utils/deep_freeze';
import {sortByUsername} from 'mattermost-redux/utils/user_utils';

const searchProfilesMatchingWithTerm = Selectors.makeSearchProfilesMatchingWithTerm();
const searchProfilesStartingWithTerm = Selectors.makeSearchProfilesStartingWithTerm();

describe('Selectors.Users', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    const channel2 = TestHelper.fakeChannelWithId(team1.id);

    const group1 = TestHelper.fakeGroupWithId();
    const group2 = TestHelper.fakeGroupWithId();

    const user1 = TestHelper.fakeUserWithId();
    user1.notify_props = {mention_keys: 'testkey1,testkey2'};
    user1.roles = 'system_admin system_user';
    const user2 = TestHelper.fakeUserWithId();
    user2.delete_at = 1;
    const user3 = TestHelper.fakeUserWithId();
    const user4 = TestHelper.fakeUserWithId();
    const user5 = TestHelper.fakeUserWithId();
    const user6 = TestHelper.fakeUserWithId();
    user6.roles = 'system_admin system_user';
    const user7 = TestHelper.fakeUserWithId();
    user7.delete_at = 1;
    user7.roles = 'system_admin system_user';
    const profiles = {};
    profiles[user1.id] = user1;
    profiles[user2.id] = user2;
    profiles[user3.id] = user3;
    profiles[user4.id] = user4;
    profiles[user5.id] = user5;
    profiles[user6.id] = user6;
    profiles[user7.id] = user7;

    const profilesInTeam = {};
    profilesInTeam[team1.id] = new Set([user1.id, user2.id, user7.id]);

    const membersInTeam = {};
    membersInTeam[team1.id] = {};
    membersInTeam[team1.id][user1.id] = {
        ...TestHelper.fakeTeamMember(user1.id, team1.id),
        scheme_user: true,
        scheme_admin: true,
    };
    membersInTeam[team1.id][user2.id] = {
        ...TestHelper.fakeTeamMember(user2.id, team1.id),
        scheme_user: true,
        scheme_admin: false,
    };
    membersInTeam[team1.id][user7.id] = {
        ...TestHelper.fakeTeamMember(user7.id, team1.id),
        scheme_user: true,
        scheme_admin: false,
    };

    const profilesNotInTeam = {};
    profilesNotInTeam[team1.id] = new Set([user3.id, user4.id]);

    const profilesWithoutTeam = new Set([user5.id, user6.id]);

    const profilesInChannel = {};
    profilesInChannel[channel1.id] = new Set([user1.id]);
    profilesInChannel[channel2.id] = new Set([user1.id, user2.id]);

    const membersInChannel = {};
    membersInChannel[channel1.id] = {};
    membersInChannel[channel1.id][user1.id] = {
        ...TestHelper.fakeChannelMember(user1.id, channel1.id),
        scheme_user: true,
        scheme_admin: true,
    };
    membersInChannel[channel2.id] = {};
    membersInChannel[channel2.id][user1.id] = {
        ...TestHelper.fakeChannelMember(user1.id, channel2.id),
        scheme_user: true,
        scheme_admin: true,
    };
    membersInChannel[channel2.id][user2.id] = {
        ...TestHelper.fakeChannelMember(user2.id, channel2.id),
        scheme_user: true,
        scheme_admin: false,
    };

    const profilesNotInChannel = {};
    profilesNotInChannel[channel1.id] = new Set([user2.id, user3.id]);
    profilesNotInChannel[channel2.id] = new Set([user4.id, user5.id]);

    const profilesInGroup = {};
    profilesInGroup[group1.id] = new Set([user1.id]);
    profilesInGroup[group2.id] = new Set([user2.id, user3.id]);

    const userSessions = [{
        create_at: 1,
        expires_at: 2,
        props: {},
        user_id: user1.id,
        roles: '',
    }];

    const userAudits = [{
        action: 'test_user_action',
        create_at: 1535007018934,
        extra_info: 'success',
        id: 'test_id',
        ip_address: '::1',
        session_id: '',
        user_id: 'test_user_id',
    }];

    const myPreferences = {};
    myPreferences[`${Preferences.CATEGORY_DIRECT_CHANNEL_SHOW}--${user2.id}`] = {category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: user2.id, value: 'true'};
    myPreferences[`${Preferences.CATEGORY_DIRECT_CHANNEL_SHOW}--${user3.id}`] = {category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: user3.id, value: 'false'};

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            users: {
                currentUserId: user1.id,
                profiles,
                profilesInTeam,
                profilesNotInTeam,
                profilesWithoutTeam,
                profilesInChannel,
                profilesNotInChannel,
                profilesInGroup,
                mySessions: userSessions,
                myAudits: userAudits,
            },
            teams: {
                currentTeamId: team1.id,
                membersInTeam,
            },
            channels: {
                currentChannelId: channel1.id,
                membersInChannel,
            },
            preferences: {
                myPreferences,
            },
        },
    });

    it('getUserIdsInChannels', () => {
        assert.deepEqual(Selectors.getUserIdsInChannels(testState), profilesInChannel);
    });

    it('getUserIdsNotInChannels', () => {
        assert.deepEqual(Selectors.getUserIdsNotInChannels(testState), profilesNotInChannel);
    });

    it('getUserIdsInTeams', () => {
        assert.deepEqual(Selectors.getUserIdsInTeams(testState), profilesInTeam);
    });

    it('getUserIdsNotInTeams', () => {
        assert.deepEqual(Selectors.getUserIdsNotInTeams(testState), profilesNotInTeam);
    });

    it('getUserIdsWithoutTeam', () => {
        assert.deepEqual(Selectors.getUserIdsWithoutTeam(testState), profilesWithoutTeam);
    });

    it('getUserSessions', () => {
        assert.deepEqual(Selectors.getUserSessions(testState), userSessions);
    });

    it('getUserAudits', () => {
        assert.deepEqual(Selectors.getUserAudits(testState), userAudits);
    });

    it('getUser', () => {
        assert.deepEqual(Selectors.getUser(testState, user1.id), user1);
    });

    it('getUsers', () => {
        assert.deepEqual(Selectors.getUsers(testState), profiles);
    });

    describe('getCurrentUserMentionKeys', () => {
        it('at mention', () => {
            const userId = '1234';
            const notifyProps = {};
            const state = {
                entities: {
                    users: {
                        currentUserId: userId,
                        profiles: {
                            [userId]: {id: userId, username: 'user', first_name: 'First', last_name: 'Last', notify_props: notifyProps},
                        },
                    },
                },
            };

            assert.deepEqual(Selectors.getCurrentUserMentionKeys(state), [{key: '@user'}]);
        });

        it('channel', () => {
            const userId = '1234';
            const notifyProps = {
                channel: 'true',
            };
            const state = {
                entities: {
                    users: {
                        currentUserId: userId,
                        profiles: {
                            [userId]: {id: userId, username: 'user', first_name: 'First', last_name: 'Last', notify_props: notifyProps},
                        },
                    },
                },
            };

            assert.deepEqual(Selectors.getCurrentUserMentionKeys(state), [{key: '@channel'}, {key: '@all'}, {key: '@here'}, {key: '@user'}]);
        });

        it('first name', () => {
            const userId = '1234';
            const notifyProps = {
                first_name: 'true',
            };
            const state = {
                entities: {
                    users: {
                        currentUserId: userId,
                        profiles: {
                            [userId]: {id: userId, username: 'user', first_name: 'First', last_name: 'Last', notify_props: notifyProps},
                        },
                    },
                },
            };

            assert.deepEqual(Selectors.getCurrentUserMentionKeys(state), [{key: 'First', caseSensitive: true}, {key: '@user'}]);
        });

        it('custom keys', () => {
            const userId = '1234';
            const notifyProps = {
                mention_keys: 'test,foo,@user,user',
            };
            const state = {
                entities: {
                    users: {
                        currentUserId: userId,
                        profiles: {
                            [userId]: {id: userId, username: 'user', first_name: 'First', last_name: 'Last', notify_props: notifyProps},
                        },
                    },
                },
            };

            assert.deepEqual(Selectors.getCurrentUserMentionKeys(state), [{key: 'test'}, {key: 'foo'}, {key: '@user'}, {key: 'user'}]);
        });
    });

    describe('getProfiles', () => {
        it('getProfiles without filter', () => {
            const users = [user1, user2, user3, user4, user5, user6, user7].sort(sortByUsername);
            assert.deepEqual(Selectors.getProfiles(testState), users);
        });

        it('getProfiles with role filter', () => {
            const users = [user1, user6, user7].sort(sortByUsername);
            assert.deepEqual(Selectors.getProfiles(testState, {role: 'system_admin'}), users);
        });
        it('getProfiles with inactive', () => {
            const users = [user2, user7].sort(sortByUsername);
            assert.deepEqual(Selectors.getProfiles(testState, {inactive: true}), users);
        });
        it('getProfiles with active', () => {
            const users = [user1, user3, user4, user5, user6].sort(sortByUsername);
            assert.deepEqual(Selectors.getProfiles(testState, {active: true}), users);
        });
        it('getProfiles with multiple filters', () => {
            const users = [user7];
            assert.deepEqual(Selectors.getProfiles(testState, {role: 'system_admin', inactive: true}), users);
        });
    });

    it('getProfilesInCurrentTeam', () => {
        const users = [user1, user2, user7].sort(sortByUsername);
        assert.deepEqual(Selectors.getProfilesInCurrentTeam(testState), users);
    });
    describe('getProfilesInTeam', () => {
        it('getProfilesInTeam without filter', () => {
            const users = [user1, user2, user7].sort(sortByUsername);
            assert.deepEqual(Selectors.getProfilesInTeam(testState, team1.id), users);
            assert.deepEqual(Selectors.getProfilesInTeam(testState, 'junk'), []);
        });
        it('getProfilesInTeam with role filter', () => {
            const users = [user1, user7].sort(sortByUsername);
            assert.deepEqual(Selectors.getProfilesInTeam(testState, team1.id, {role: 'system_admin'}), users);
            assert.deepEqual(Selectors.getProfilesInTeam(testState, 'junk', {role: 'system_admin'}), []);
        });
        it('getProfilesInTeam with inactive filter', () => {
            const users = [user2, user7].sort(sortByUsername);
            assert.deepEqual(Selectors.getProfilesInTeam(testState, team1.id, {inactive: true}), users);
            assert.deepEqual(Selectors.getProfilesInTeam(testState, 'junk', {inactive: true}), []);
        });
        it('getProfilesInTeam with active', () => {
            const users = [user1];
            assert.deepEqual(Selectors.getProfilesInTeam(testState, team1.id, {active: true}), users);
            assert.deepEqual(Selectors.getProfilesInTeam(testState, 'junk', {active: true}), []);
        });
        it('getProfilesInTeam with role filters', () => {
            assert.deepEqual(Selectors.getProfilesInTeam(testState, team1.id, {roles: ['system_admin']}), [user1, user7].sort(sortByUsername));
            assert.deepEqual(Selectors.getProfilesInTeam(testState, team1.id, {team_roles: ['team_user']}), [user2]);
        });
        it('getProfilesInTeam with multiple filters', () => {
            const users = [user7];
            assert.deepEqual(Selectors.getProfilesInTeam(testState, team1.id, {role: 'system_admin', inactive: true}), users);
        });
    });

    describe('getProfilesNotInTeam', () => {
        const users = [user3, user4].sort(sortByUsername);
        assert.deepEqual(Selectors.getProfilesNotInTeam(testState, team1.id), users);
        assert.deepEqual(Selectors.getProfilesNotInTeam(testState, team1.id, {role: 'system_user'}), users);
        assert.deepEqual(Selectors.getProfilesNotInTeam(testState, team1.id, {role: 'system_guest'}), []);
    });

    it('getProfilesNotInCurrentTeam', () => {
        const users = [user3, user4].sort(sortByUsername);
        assert.deepEqual(Selectors.getProfilesNotInCurrentTeam(testState), users);
    });

    describe('getProfilesWithoutTeam', () => {
        it('getProfilesWithoutTeam', () => {
            const users = [user5, user6].sort(sortByUsername);
            assert.deepEqual(Selectors.getProfilesWithoutTeam(testState), users);
        });
        it('getProfilesWithoutTeam with filter', () => {
            assert.deepEqual(Selectors.getProfilesWithoutTeam(testState, {role: 'system_admin'}), [user6]);
        });
    });

    it('getProfilesInGroup', () => {
        assert.deepEqual(Selectors.getProfilesInGroup(testState, group1.id), [user1]);
        const users = [user2, user3].sort(sortByUsername);
        assert.deepEqual(Selectors.getProfilesInGroup(testState, group2.id), users);
    });

    describe('searchProfilesStartingWithTerm', () => {
        it('searchProfiles without filter', () => {
            assert.deepEqual(searchProfilesStartingWithTerm(testState, user1.username), [user1]);
            assert.deepEqual(searchProfilesStartingWithTerm(testState, user2.first_name + ' ' + user2.last_name), [user2]);
            assert.deepEqual(searchProfilesStartingWithTerm(testState, user1.username, true), []);
        });

        it('searchProfiles with filters', () => {
            assert.deepEqual(searchProfilesStartingWithTerm(testState, user1.username, false, {role: 'system_admin'}), [user1]);
            assert.deepEqual(searchProfilesStartingWithTerm(testState, user3.username, false, {role: 'system_admin'}), []);
            assert.deepEqual(searchProfilesStartingWithTerm(testState, user1.username, false, {roles: ['system_user']}), []);
            assert.deepEqual(searchProfilesStartingWithTerm(testState, user3.username, false, {roles: ['system_user']}), [user3]);
            assert.deepEqual(searchProfilesStartingWithTerm(testState, user3.username, false, {inactive: true}), []);
            assert.deepEqual(searchProfilesStartingWithTerm(testState, user2.username, false, {inactive: true}), [user2]);
            assert.deepEqual(searchProfilesStartingWithTerm(testState, user2.username, false, {active: true}), []);
            assert.deepEqual(searchProfilesStartingWithTerm(testState, user3.username, false, {active: true}), [user3]);
        });
    });

    describe('searchProfilesMatchingWithTerm', () => {
        it('searchProfiles without filter', () => {
            assert.deepEqual(searchProfilesMatchingWithTerm(testState, user1.username.slice(1, user1.username.length)), [user1]);
            assert.deepEqual(searchProfilesMatchingWithTerm(testState, ' ' + user2.last_name), [user2]);
        });

        it('searchProfiles with filters', () => {
            assert.deepEqual(searchProfilesMatchingWithTerm(testState, user1.username.slice(2, user1.username.length), false, {role: 'system_admin'}), [user1]);
            assert.deepEqual(searchProfilesMatchingWithTerm(testState, user3.username.slice(3, user3.username.length), false, {role: 'system_admin'}), []);
            assert.deepEqual(searchProfilesMatchingWithTerm(testState, user1.username.slice(0, user1.username.length), false, {roles: ['system_user']}), []);
            assert.deepEqual(searchProfilesMatchingWithTerm(testState, user3.username, false, {roles: ['system_user']}), [user3]);
            assert.deepEqual(searchProfilesMatchingWithTerm(testState, user3.username, false, {inactive: true}), []);
            assert.deepEqual(searchProfilesMatchingWithTerm(testState, user2.username, false, {inactive: true}), [user2]);
            assert.deepEqual(searchProfilesMatchingWithTerm(testState, user2.username, false, {active: true}), []);
            assert.deepEqual(searchProfilesMatchingWithTerm(testState, user3.username, false, {active: true}), [user3]);
        });
    });

    it('searchProfilesInChannel', () => {
        const doSearchProfilesInChannel = Selectors.makeSearchProfilesInChannel();
        assert.deepEqual(doSearchProfilesInChannel(testState, channel1.id, user1.username), [user1]);
        assert.deepEqual(doSearchProfilesInChannel(testState, channel1.id, user1.username, true), []);
        assert.deepEqual(doSearchProfilesInChannel(testState, channel2.id, user2.username), [user2]);
        assert.deepEqual(doSearchProfilesInChannel(testState, channel2.id, user2.username, false, {active: true}), []);
    });

    it('searchProfilesInCurrentChannel', () => {
        assert.deepEqual(Selectors.searchProfilesInCurrentChannel(testState, user1.username), [user1]);
        assert.deepEqual(Selectors.searchProfilesInCurrentChannel(testState, user1.username, true), []);
    });

    it('searchProfilesNotInCurrentChannel', () => {
        assert.deepEqual(Selectors.searchProfilesNotInCurrentChannel(testState, user2.username), [user2]);
        assert.deepEqual(Selectors.searchProfilesNotInCurrentChannel(testState, user2.username, true), [user2]);
    });

    it('searchProfilesInCurrentTeam', () => {
        assert.deepEqual(Selectors.searchProfilesInCurrentTeam(testState, user1.username), [user1]);
        assert.deepEqual(Selectors.searchProfilesInCurrentTeam(testState, user1.username, true), []);
    });

    describe('searchProfilesInTeam', () => {
        it('searchProfilesInTeam without filter', () => {
            assert.deepEqual(Selectors.searchProfilesInTeam(testState, team1.id, user1.username), [user1]);
            assert.deepEqual(Selectors.searchProfilesInTeam(testState, team1.id, user1.username, true), []);
        });
        it('searchProfilesInTeam with filter', () => {
            assert.deepEqual(Selectors.searchProfilesInTeam(testState, team1.id, user1.username, false, {role: 'system_admin'}), [user1]);
            assert.deepEqual(Selectors.searchProfilesInTeam(testState, team1.id, user1.username, false, {inactive: true}), []);
            assert.deepEqual(Selectors.searchProfilesInTeam(testState, team1.id, user2.username, false, {active: true}), []);
            assert.deepEqual(Selectors.searchProfilesInTeam(testState, team1.id, user1.username, false, {active: true}), [user1]);
        });
        it('getProfiles with multiple filters', () => {
            const users = [user7];
            assert.deepEqual(Selectors.searchProfilesInTeam(testState, team1.id, user7.username, false, {role: 'system_admin', inactive: true}), users);
        });
    });

    it('searchProfilesNotInCurrentTeam', () => {
        assert.deepEqual(Selectors.searchProfilesNotInCurrentTeam(testState, user3.username), [user3]);
        assert.deepEqual(Selectors.searchProfilesNotInCurrentTeam(testState, user3.username, true), [user3]);
    });

    describe('searchProfilesWithoutTeam', () => {
        it('searchProfilesWithoutTeam without filter', () => {
            assert.deepEqual(Selectors.searchProfilesWithoutTeam(testState, user5.username), [user5]);
            assert.deepEqual(Selectors.searchProfilesWithoutTeam(testState, user5.username, true), [user5]);
        });
        it('searchProfilesWithoutTeam with filter', () => {
            assert.deepEqual(Selectors.searchProfilesWithoutTeam(testState, user6.username, false, {role: 'system_admin'}), [user6]);
            assert.deepEqual(Selectors.searchProfilesWithoutTeam(testState, user5.username, false, {inactive: true}), []);
        });
    });
    it('searchProfilesInGroup', () => {
        assert.deepEqual(Selectors.searchProfilesInGroup(testState, group1.id, user5.username), []);
        assert.deepEqual(Selectors.searchProfilesInGroup(testState, group1.id, user1.username), [user1]);
        assert.deepEqual(Selectors.searchProfilesInGroup(testState, group2.id, user2.username), [user2]);
        assert.deepEqual(Selectors.searchProfilesInGroup(testState, group2.id, user3.username), [user3]);
    });

    it('isCurrentUserSystemAdmin', () => {
        assert.deepEqual(Selectors.isCurrentUserSystemAdmin(testState), true);
    });

    it('getUserByUsername', () => {
        assert.deepEqual(Selectors.getUserByUsername(testState, user1.username), user1);
    });

    it('getUsersInVisibleDMs', () => {
        assert.deepEqual(Selectors.getUsersInVisibleDMs(testState), [user2]);
    });

    it('getUserByEmail', () => {
        assert.deepEqual(Selectors.getUserByEmail(testState, user1.email), user1);
        assert.deepEqual(Selectors.getUserByEmail(testState, user2.email), user2);
    });

    it('makeGetProfilesInChannel', () => {
        const getProfilesInChannel = Selectors.makeGetProfilesInChannel();
        assert.deepEqual(getProfilesInChannel(testState, channel1.id), [user1]);

        const users = [user1, user2].sort(sortByUsername);
        assert.deepEqual(getProfilesInChannel(testState, channel2.id), users);
        assert.deepEqual(getProfilesInChannel(testState, channel2.id, {active: true}), [user1]);
        assert.deepEqual(getProfilesInChannel(testState, channel2.id, {channel_roles: ['channel_admin']}), []);
        assert.deepEqual(getProfilesInChannel(testState, channel2.id, {channel_roles: ['channel_user']}), [user2]);
        assert.deepEqual(getProfilesInChannel(testState, channel2.id, {channel_roles: ['channel_admin', 'channel_user']}), [user2]);
        assert.deepEqual(getProfilesInChannel(testState, channel2.id, {roles: ['system_admin'], channel_roles: ['channel_admin', 'channel_user']}), [user1, user2].sort(sortByUsername));

        assert.deepEqual(getProfilesInChannel(testState, 'nonexistentid'), []);
        assert.deepEqual(getProfilesInChannel(testState, 'nonexistentid'), []);
    });

    it('makeGetProfilesInChannel, unknown user id in channel', () => {
        const state = {
            ...testState,
            entities: {
                ...testState.entities,
                users: {
                    ...testState.entities.users,
                    profilesInChannel: {
                        ...testState.entities.users.profilesInChannel,
                        [channel1.id]: new Set([...testState.entities.users.profilesInChannel[channel1.id], 'unknown']),
                    },
                },
            },
        };

        const getProfilesInChannel = Selectors.makeGetProfilesInChannel();
        assert.deepEqual(getProfilesInChannel(state, channel1.id), [user1]);
        assert.deepEqual(getProfilesInChannel(state, channel1.id, true), [user1]);
    });

    it('makeGetProfilesNotInChannel', () => {
        const getProfilesNotInChannel = Selectors.makeGetProfilesNotInChannel();

        assert.deepEqual(getProfilesNotInChannel(testState, channel1.id, {active: true}), [user3].sort(sortByUsername));
        assert.deepEqual(getProfilesNotInChannel(testState, channel1.id), [user2, user3].sort(sortByUsername));

        assert.deepEqual(getProfilesNotInChannel(testState, channel2.id, {active: true}), [user4, user5].sort(sortByUsername));
        assert.deepEqual(getProfilesNotInChannel(testState, channel2.id), [user4, user5].sort(sortByUsername));

        assert.deepEqual(getProfilesNotInChannel(testState, channel1.id, {role: 'system_guest'}), []);
        assert.deepEqual(getProfilesNotInChannel(testState, channel2.id, {role: 'system_user'}), [user4, user5].sort(sortByUsername));

        assert.deepEqual(getProfilesNotInChannel(testState, 'nonexistentid'), []);
        assert.deepEqual(getProfilesNotInChannel(testState, 'nonexistentid'), []);
    });

    it('makeGetProfilesByIdsAndUsernames', () => {
        const getProfilesByIdsAndUsernames = Selectors.makeGetProfilesByIdsAndUsernames();

        const testCases = [
            {input: {allUserIds: [], allUsernames: []}, output: []},
            {input: {allUserIds: ['nonexistentid'], allUsernames: ['nonexistentid']}, output: []},
            {input: {allUserIds: [user1.id], allUsernames: []}, output: [user1]},
            {input: {allUserIds: [user1.id]}, output: [user1]},
            {input: {allUserIds: [user1.id, 'nonexistentid']}, output: [user1]},
            {input: {allUserIds: [user1.id, user2.id]}, output: [user1, user2]},
            {input: {allUserIds: ['nonexistentid', user1.id, user2.id]}, output: [user1, user2]},
            {input: {allUserIds: [], allUsernames: [user1.username]}, output: [user1]},
            {input: {allUsernames: [user1.username]}, output: [user1]},
            {input: {allUsernames: [user1.username, 'nonexistentid']}, output: [user1]},
            {input: {allUsernames: [user1.username, user2.username]}, output: [user1, user2]},
            {input: {allUsernames: [user1.username, 'nonexistentid', user2.username]}, output: [user1, user2]},
            {input: {allUserIds: [user1.id], allUsernames: [user2.username]}, output: [user1, user2]},
            {input: {allUserIds: [user1.id, user2.id], allUsernames: [user3.username, user4.username]}, output: [user1, user2, user3, user4]},
            {input: {allUserIds: [user1.username, user2.username], allUsernames: [user3.id, user4.id]}, output: []},
        ];

        testCases.forEach((testCase) => {
            assert.deepEqual(getProfilesByIdsAndUsernames(testState, testCase.input), testCase.output);
        });
    });

    describe('makeGetDisplayName and makeDisplayNameGetter', () => {
        const testUser1 = {
            ...user1,
            id: 'test_user_id',
            username: 'username',
            first_name: 'First',
            last_name: 'Last',
        };
        const newProfiles = {
            ...profiles,
            [testUser1.id]: testUser1,
        };
        it('Should show full name since preferences is being used and LockTeammateNameDisplay is false', () => {
            const newTestState = {
                entities: {
                    users: {profiles: newProfiles},
                    preferences: {
                        myPreferences: {
                            [`${Preferences.CATEGORY_DISPLAY_SETTINGS}--${Preferences.NAME_NAME_FORMAT}`]: {
                                value: General.TEAMMATE_NAME_DISPLAY.SHOW_FULLNAME,
                            },
                        },
                    },
                    general: {
                        config: {
                            TeammateNameDisplay: General.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME,
                            LockTeammateNameDisplay: 'false',
                        },
                        license: {
                            LockTeammateNameDisplay: 'true',
                        },
                    },
                },
            };
            assert.deepEqual(Selectors.makeGetDisplayName()(newTestState, testUser1.id), 'First Last');
            assert.deepEqual(Selectors.makeDisplayNameGetter()(newTestState)(testUser1), 'First Last');
        });
        it('Should show show username since LockTeammateNameDisplay is true', () => {
            const newTestState = {
                entities: {
                    users: {profiles: newProfiles},
                    preferences: {
                        myPreferences: {
                            [`${Preferences.CATEGORY_DISPLAY_SETTINGS}--${Preferences.NAME_NAME_FORMAT}`]: {
                                value: General.TEAMMATE_NAME_DISPLAY.SHOW_FULLNAME,
                            },
                        },
                    },
                    general: {
                        config: {
                            TeammateNameDisplay: General.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME,
                            LockTeammateNameDisplay: 'true',
                        },
                        license: {
                            LockTeammateNameDisplay: 'true',
                        },
                    },
                },
            };
            assert.deepEqual(Selectors.makeGetDisplayName()(newTestState, testUser1.id), 'username');
            assert.deepEqual(Selectors.makeDisplayNameGetter()(newTestState)(testUser1), 'username');
        });
        it('Should show full name since license is false', () => {
            const newTestState = {
                entities: {
                    users: {profiles: newProfiles},
                    preferences: {
                        myPreferences: {
                            [`${Preferences.CATEGORY_DISPLAY_SETTINGS}--${Preferences.NAME_NAME_FORMAT}`]: {
                                value: General.TEAMMATE_NAME_DISPLAY.SHOW_FULLNAME,
                            },
                        },
                    },
                    general: {
                        config: {
                            TeammateNameDisplay: General.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME,
                            LockTeammateNameDisplay: 'true',
                        },
                        license: {
                            LockTeammateNameDisplay: 'false',
                        },
                    },
                },
            };
            assert.deepEqual(Selectors.makeGetDisplayName()(newTestState, testUser1.id), 'First Last');
            assert.deepEqual(Selectors.makeDisplayNameGetter()(newTestState)(testUser1), 'First Last');
        });
        it('Should show full name since license is not available', () => {
            const newTestState = {
                entities: {
                    users: {profiles: newProfiles},
                    preferences: {
                        myPreferences: {
                            [`${Preferences.CATEGORY_DISPLAY_SETTINGS}--${Preferences.NAME_NAME_FORMAT}`]: {
                                value: General.TEAMMATE_NAME_DISPLAY.SHOW_FULLNAME,
                            },
                        },
                    },
                    general: {
                        config: {
                            TeammateNameDisplay: General.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME,
                            LockTeammateNameDisplay: 'true',
                        },
                    },
                },
            };
            assert.deepEqual(Selectors.makeGetDisplayName()(newTestState, testUser1.id), 'First Last');
            assert.deepEqual(Selectors.makeDisplayNameGetter()(newTestState)(testUser1), 'First Last');
        });
        it('Should show Full name since license is not available and lock teammate name display is false', () => {
            const newTestState = {
                entities: {
                    users: {profiles: newProfiles},
                    preferences: {
                        myPreferences: {
                            [`${Preferences.CATEGORY_DISPLAY_SETTINGS}--${Preferences.NAME_NAME_FORMAT}`]: {
                                value: General.TEAMMATE_NAME_DISPLAY.SHOW_FULLNAME,
                            },
                        },
                    },
                    general: {
                        config: {
                            TeammateNameDisplay: General.TEAMMATE_NAME_DISPLAY.SHOW_USERNAME,
                            LockTeammateNameDisplay: 'false',
                        },
                    },
                },
            };
            assert.deepEqual(Selectors.makeGetDisplayName()(newTestState, testUser1.id), 'First Last');
            assert.deepEqual(Selectors.makeDisplayNameGetter()(newTestState)(testUser1), 'First Last');
        });
        it('Should show username since no settings are available (falls back to default)', () => {
            const newTestState = {
                entities: {
                    users: {profiles: newProfiles},
                    preferences: {
                        myPreferences: {
                            [`${Preferences.CATEGORY_DISPLAY_SETTINGS}--${Preferences.NAME_NAME_FORMAT}`]: {
                            },
                        },
                    },
                    general: {
                        config: {
                        },
                    },
                },
            };
            assert.deepEqual(Selectors.makeGetDisplayName()(newTestState, testUser1.id), 'username');
            assert.deepEqual(Selectors.makeDisplayNameGetter()(newTestState)(testUser1), 'username');
        });
    });

    it('shouldShowTermsOfService', () => {
        const userId = 1234;

        // Test latest terms not accepted
        assert.equal(Selectors.shouldShowTermsOfService({
            entities: {
                general: {
                    config: {
                        CustomTermsOfServiceId: '1',
                        EnableCustomTermsOfService: 'true',
                    },
                    license: {
                        IsLicensed: 'true',
                    },
                },
                users: {
                    currentUserId: userId,
                    profiles: {
                        [userId]: {id: userId, username: 'user', first_name: 'First', last_name: 'Last'},
                    },
                },
            },
        }), true);

        // Test Feature disabled
        assert.equal(Selectors.shouldShowTermsOfService({
            entities: {
                general: {
                    config: {
                        CustomTermsOfServiceId: '1',
                        EnableCustomTermsOfService: 'false',
                    },
                    license: {
                        IsLicensed: 'true',
                    },
                },
                users: {
                    currentUserId: userId,
                    profiles: {
                        [userId]: {id: userId, username: 'user', first_name: 'First', last_name: 'Last'},
                    },
                },
            },
        }), false);

        // Test unlicensed
        assert.equal(Selectors.shouldShowTermsOfService({
            entities: {
                general: {
                    config: {
                        CustomTermsOfServiceId: '1',
                        EnableCustomTermsOfService: 'true',
                    },
                    license: {
                        IsLicensed: 'false',
                    },
                },
                users: {
                    currentUserId: userId,
                    profiles: {
                        [userId]: {id: userId, username: 'user', first_name: 'First', last_name: 'Last'},
                    },
                },
            },
        }), false);

        // Test terms already accepted
        assert.equal(Selectors.shouldShowTermsOfService({
            entities: {
                general: {
                    config: {
                        CustomTermsOfServiceId: '1',
                        EnableCustomTermsOfService: 'true',
                    },
                    license: {
                        IsLicensed: 'true',
                    },
                },
                users: {
                    currentUserId: userId,
                    profiles: {
                        [userId]: {id: userId, username: 'user', first_name: 'First', last_name: 'Last', terms_of_service_id: '1', terms_of_service_create_at: new Date().getTime()},
                    },
                },
            },
        }), false);

        // Test not logged in
        assert.equal(Selectors.shouldShowTermsOfService({
            entities: {
                general: {
                    config: {
                        CustomTermsOfServiceId: '1',
                        EnableCustomTermsOfService: 'true',
                    },
                    license: {
                        IsLicensed: 'true',
                    },
                },
                users: {
                    currentUserId: userId,
                    profiles: {},
                },
            },
        }), false);
    });

    describe('currentUserHasAnAdminRole', () => {
        it('returns the expected result', () => {
            assert.equal(Selectors.currentUserHasAnAdminRole(testState), true);
            const state = {
                ...testState,
                entities: {
                    ...testState.entities,
                    users: {
                        ...testState.entities.users,
                        currentUserId: user2.id,
                    },
                },
            };
            assert.equal(Selectors.currentUserHasAnAdminRole(state), false);
        });
    });
});
