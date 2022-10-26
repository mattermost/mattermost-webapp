// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import nock from 'nock';

import {
    searchMoreChannels,
    addUsersToChannel,
    openDirectChannelToUserId,
    openGroupChannelToUserIds,
    loadChannelsForCurrentUser, fetchChannelsAndMembers,
} from 'actions/channel_actions';
import {loadProfilesForSidebar} from 'actions/user_actions';
import {
    CHANNELS_MAX_PER_PAGE,
    CHANNEL_MEMBERS_MAX_PER_PAGE,
} from 'actions/channel_queries';

import {Channel} from '@mattermost/types/channels';
import {Team} from '@mattermost/types/teams';
import {UserProfile} from '@mattermost/types/users';
import {Role} from '@mattermost/types/roles';

import {Client4} from 'mattermost-redux/client';
import TestHelper from 'packages/mattermost-redux/test/test_helper';
import mockStore from 'tests/test_store';
import configureStore from 'store';

const initialState = {
    entities: {
        channels: {
            currentChannelId: 'current_channel_id',
            myMembers: {
                current_channel_id: {
                    channel_id: 'current_channel_id',
                    user_id: 'current_user_id',
                    roles: 'channel_role',
                    mention_count: 1,
                    msg_count: 9,
                },
            },
            channels: {
                current_channel_id: {
                    id: 'current_channel_id',
                    name: 'default-name',
                    display_name: 'Default',
                    delete_at: 0,
                    type: 'O',
                    team_id: 'team_id',
                },
                current_user_id__existingId: {
                    id: 'current_user_id__existingId',
                    name: 'current_user_id__existingId',
                    display_name: 'Default',
                    delete_at: 0,
                    type: '0',
                    team_id: 'team_id',
                },
            },
            channelsInTeam: {
                'team-id': ['current_channel_id'],
            },
            messageCounts: {
                current_channel_id: {total: 10},
                current_user_id__existingId: {total: 0},
            },
        },
        teams: {
            currentTeamId: 'team-id',
            teams: {
                'team-id': {
                    id: 'team_id',
                    name: 'team-1',
                    displayName: 'Team 1',
                },
            },
            myMembers: {
                'team-id': {roles: 'team_role'},
            },
        },
        users: {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_role'},
            },
        },
        preferences: {
            myPreferences: {
                'display_settings--name_format': {
                    category: 'display_settings',
                    name: 'name_format',
                    user_id: 'current_user_id',
                    value: 'username',
                },
            },
        },
        roles: {
            roles: {
                system_role: {
                    permissions: [],
                },
                team_role: {
                    permissions: [],
                },
                channel_role: {
                    permissions: [],
                },
            },
        },
        general: {
            license: {IsLicensed: 'false'},
            serverVersion: '5.4.0',
            config: {PostEditTimeLimit: -1},
        },
    },
};

const realDateNow = Date.now;

jest.mock('mattermost-redux/actions/channels', () => ({
    fetchMyChannelsAndMembersREST: (...args: any) => ({type: 'MOCK_FETCH_CHANNELS_AND_MEMBERS', args}),
    searchChannels: () => {
        return {
            type: 'MOCK_SEARCH_CHANNELS',
            data: [{
                id: 'channel-id',
                name: 'channel-name',
                display_name: 'Channel',
                delete_at: 0,
                type: 'O',
            }],
        };
    },
    addChannelMember: (...args: any) => ({type: 'MOCK_ADD_CHANNEL_MEMBER', args}),
    createDirectChannel: (...args: any) => ({type: 'MOCK_CREATE_DIRECT_CHANNEL', args}),
    createGroupChannel: (...args: any) => ({type: 'MOCK_CREATE_GROUP_CHANNEL', args}),
}));

jest.mock('actions/user_actions', () => ({
    loadNewDMIfNeeded: jest.fn(),
    loadNewGMIfNeeded: jest.fn(),
    loadProfilesForSidebar: jest.fn(),
}));

describe('Actions.Channel', () => {
    test('loadChannelsForCurrentUser', async () => {
        const testStore = await mockStore(initialState);

        const expectedActions = [{
            type: 'MOCK_FETCH_CHANNELS_AND_MEMBERS',
            args: ['team-id'],
        }];

        await testStore.dispatch(loadChannelsForCurrentUser());
        expect(testStore.getActions()).toEqual(expectedActions);
        expect(loadProfilesForSidebar).toHaveBeenCalledTimes(1);
    });

    test('searchMoreChannels', async () => {
        const testStore = await mockStore(initialState);

        const expectedActions = [{
            type: 'MOCK_SEARCH_CHANNELS',
            data: [{
                id: 'channel-id',
                name: 'channel-name',
                display_name: 'Channel',
                delete_at: 0,
                type: 'O',
            }],
        }];

        await testStore.dispatch(searchMoreChannels('', false));
        expect(testStore.getActions()).toEqual(expectedActions);
    });

    test('addUsersToChannel', async () => {
        const testStore = await mockStore(initialState);

        const expectedActions = [{
            type: 'MOCK_ADD_CHANNEL_MEMBER',
            args: ['testid', 'testuserid'],
        }];

        const fakeData = {
            channel: 'testid',
            userIds: ['testuserid'],
        };

        await testStore.dispatch(addUsersToChannel(fakeData.channel, fakeData.userIds));
        expect(testStore.getActions()).toEqual(expectedActions);
    });

    test('openDirectChannelToUserId Not Existing', async () => {
        const testStore = await mockStore(initialState);

        const expectedActions = [{
            type: 'MOCK_CREATE_DIRECT_CHANNEL',
            args: ['current_user_id', 'testid'],
        }];

        const fakeData = {
            userId: 'testid',
        };

        await testStore.dispatch(openDirectChannelToUserId(fakeData.userId));
        expect(testStore.getActions()).toEqual(expectedActions);
    });

    test('openDirectChannelToUserId Existing', async () => {
        Date.now = () => new Date(0).getMilliseconds();
        const testStore = await mockStore(initialState);
        const expectedActions = [
            {
                meta: {
                    batch: true,
                },
                payload: [
                    {
                        data: [
                            {
                                category: 'direct_channel_show',
                                name: 'existingId',
                                value: 'true',
                            },
                        ],
                        type: 'RECEIVED_PREFERENCES',
                    },
                    {
                        data: [
                            {
                                category: 'channel_open_time',
                                name: 'current_user_id__existingId',
                                value: '0',
                            },
                        ],
                        type: 'RECEIVED_PREFERENCES',
                    },
                ],
                type: 'BATCHING_REDUCER.BATCH',
            },
            {
                data: [
                    {
                        category: 'direct_channel_show',
                        name: 'existingId',
                        user_id: 'current_user_id',
                        value: 'true',
                    },
                    {
                        category: 'channel_open_time',
                        name: 'current_user_id__existingId',
                        user_id: 'current_user_id',
                        value: '0',
                    },
                ],
                type: 'RECEIVED_PREFERENCES',
            },
        ];
        const fakeData = {
            userId: 'existingId',
        };

        await testStore.dispatch(openDirectChannelToUserId(fakeData.userId));

        const doneActions = testStore.getActions();
        expect(doneActions).toEqual(expectedActions);
        Date.now = realDateNow;
    });

    test('openGroupChannelToUserIds', async () => {
        const testStore = await mockStore(initialState);

        const expectedActions = [{
            type: 'MOCK_CREATE_GROUP_CHANNEL',
            args: [['testuserid1', 'testuserid2']],
        }];

        const fakeData = {
            userIds: ['testuserid1', 'testuserid2'],
        };

        await testStore.dispatch(openGroupChannelToUserIds(fakeData.userIds));
        expect(testStore.getActions()).toEqual(expectedActions);
    });

    describe('fetchChannelsAndMembers', () => {
        beforeAll(() => {
            TestHelper.initBasic(Client4);
        });

        afterEach(() => {
            nock.cleanAll();
        });

        afterAll(() => {
            TestHelper.tearDown();
        });

        test('should throws error when response errors out', async () => {
            const store = configureStore();

            nock(Client4.getGraphQLUrl()).
                post('').reply(400, {
                    data: null,
                    errors: [{message: 'some error'}],
                });

            const result = await store.dispatch(fetchChannelsAndMembers());

            expect(Object.keys(result)).toEqual(['error']);
        });

        test('should throws error when response is empty', async () => {
            const store = configureStore();

            nock(Client4.getGraphQLUrl()).
                post('').reply(200, {
                    data: null,
                });

            const result = await store.dispatch(fetchChannelsAndMembers());

            expect(Object.keys(result)).toEqual(['error']);
        });

        test('should return correct channels, channel members and roles when under max limit', async () => {
            const store = configureStore();

            const channel1 = fakeChannelWithId('team1');
            const channel2 = fakeChannelWithId('team2');
            const role1 = TestHelper.basicRoles?.system_admin as Role;
            const role2 = TestHelper.basicRoles?.system_user as Role;
            const channelMember1 = fakeChannelMember('user1', channel1.id, [role1, role2]);
            const channelMember2 = fakeChannelMember('user1', channel2.id, [role1]);

            nock(Client4.getGraphQLUrl()).
                post('').
                reply(200, {
                    data: {
                        channels: [channel1, channel2],
                        channelMembers: [channelMember1, channelMember2],
                    },
                });

            const result = await store.dispatch(fetchChannelsAndMembers());

            expect(result.data.channels.length).toEqual(2);
            expect(result.data.channels[0].id).toEqual(channel1.id);
            expect(result.data.channels[1].id).toEqual(channel2.id);
            expect(result.data.channelMembers.length).toEqual(2);
            expect(result.data.channelMembers[0].channel_id).toEqual(channelMember1.channel_id);
            expect(result.data.channelMembers[1].channel_id).toEqual(channelMember2.channel_id);
            expect(result.data.roles.length).toEqual(3);
            expect(result.data.roles).toEqual([role1, role2, role1]);
        });

        test('should return correct channels, channel members and roles at a count exactly at max limit', async () => {
            const store = configureStore();

            const role1 = TestHelper.basicRoles?.system_admin as Role;
            const role2 = TestHelper.basicRoles?.system_user as Role;

            const channelsP1 = [];
            const channelMembersP1 = [];

            for (let i = 1; i <= CHANNELS_MAX_PER_PAGE; i++) {
                const channel = fakeChannelWithId(`team${i}`);
                channelsP1.push(channel);
            }

            for (let i = 1; i <= CHANNEL_MEMBERS_MAX_PER_PAGE; i++) {
                channelMembersP1.push(fakeChannelMember('user1', `channel${i}`, [role1, role2]));
            }

            nock(Client4.getGraphQLUrl()).
                post('').
                reply(200, {
                    data: {
                        channels: [...channelsP1],
                        channelMembers: [...channelMembersP1],
                    },
                });

            nock(Client4.getGraphQLUrl()).
                post('').
                reply(200, {
                    data: {
                        channels: [], // no second page of channels
                    },
                });
            nock(Client4.getGraphQLUrl()).
                post('').
                reply(200, {
                    data: {
                        channelMembers: [], // no second page of channel members
                    },
                });

            const result = await store.dispatch(fetchChannelsAndMembers());
            expect(result.data.channels.length).toEqual(CHANNELS_MAX_PER_PAGE);
            expect(result.data.channelMembers.length).toEqual(CHANNEL_MEMBERS_MAX_PER_PAGE);
        });

        test('should return correct channels, channel members and roles at a count more tha max limit', async () => {
            const store = configureStore();

            const role1 = TestHelper.basicRoles?.system_admin as Role;
            const role2 = TestHelper.basicRoles?.system_user as Role;

            const channelsP1 = [];
            const channelMembersP1 = [];
            for (let i = 1; i <= CHANNELS_MAX_PER_PAGE; i++) {
                const channel = fakeChannelWithId(`team${i}`);
                channelsP1.push(channel);
            }
            for (let i = 1; i <= CHANNEL_MEMBERS_MAX_PER_PAGE; i++) {
                const random0or1 = Math.round(Math.random());
                channelMembersP1.push(fakeChannelMember('user1', `channel${i}`, random0or1 === 0 ? [role1, role2] : [role2]));
            }

            const countOfP2Channels = 5;
            const countOfP2ChannelMembers = 6;

            const channelsP2 = [];
            const channelMembersP2 = [];
            for (let i = CHANNELS_MAX_PER_PAGE + 1; i <= CHANNELS_MAX_PER_PAGE + countOfP2Channels; i++) {
                const channel = fakeChannelWithId(`team${i}`);
                channelsP2.push(channel);
            }
            for (let i = CHANNEL_MEMBERS_MAX_PER_PAGE + 1; i <= CHANNEL_MEMBERS_MAX_PER_PAGE + countOfP2ChannelMembers; i++) {
                const random0or1 = Math.round(Math.random());
                channelMembersP2.push(fakeChannelMember('user1', `channel${i}`, random0or1 === 0 ? [role1, role2] : [role2]));
            }

            nock(Client4.getGraphQLUrl()).
                post('').
                reply(200, {
                    data: {
                        channels: [...channelsP1],
                        channelMembers: [...channelMembersP1],
                    },
                });

            nock(Client4.getGraphQLUrl()).
                post('').
                reply(200, {
                    data: {
                        channels: [...channelsP2],
                    },
                });
            nock(Client4.getGraphQLUrl()).
                post('').
                reply(200, {
                    data: {
                        channelMembers: [...channelMembersP2],
                    },
                });

            const result = await store.dispatch(fetchChannelsAndMembers());
            expect(result.data.channels.length).toEqual(CHANNELS_MAX_PER_PAGE + countOfP2Channels);
            expect(result.data.channelMembers.length).toEqual(CHANNEL_MEMBERS_MAX_PER_PAGE + countOfP2ChannelMembers);
        });

        function fakeChannelWithId(teamId: Team['id']) {
            return Object.assign(TestHelper.fakeChannelWithId(teamId), {
                team: {id: teamId},
            });
        }

        function fakeChannelMember(userId: UserProfile['id'], channelId: Channel['id'], roles: Role[] = []) {
            return Object.assign(TestHelper.fakeChannelMember(userId, channelId), {
                channel: {
                    id: channelId,
                },
                user: {
                    id: userId,
                },
                roles: [...roles],
            });
        }
    });
});

