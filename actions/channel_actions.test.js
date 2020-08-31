// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import * as Actions from 'actions/channel_actions';
import {loadProfilesForSidebar} from 'actions/user_actions.jsx';

const mockStore = configureStore([thunk]);

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
                    total_msg_count: 10,
                    team_id: 'team_id',
                },
                current_user_id__existingId: {
                    id: 'current_user_id__existingId',
                    name: 'current_user_id__existingId',
                    display_name: 'Default',
                    delete_at: 0,
                    type: '0',
                    total_msg_count: 0,
                    team_id: 'team_id',
                },
            },
            channelsInTeam: {
                'team-id': ['current_channel_id'],
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
    fetchMyChannelsAndMembers: (...args) => ({type: 'MOCK_FETCH_CHANNELS_AND_MEMBERS', args}),
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
    addChannelMember: (...args) => ({type: 'MOCK_ADD_CHANNEL_MEMBER', args}),
    createDirectChannel: (...args) => ({type: 'MOCK_CREATE_DIRECT_CHANNEL', args}),
    createGroupChannel: (...args) => ({type: 'MOCK_CREATE_GROUP_CHANNEL', args}),
}));

jest.mock('actions/user_actions.jsx', () => ({
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

        await testStore.dispatch(Actions.loadChannelsForCurrentUser());
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

        await testStore.dispatch(Actions.searchMoreChannels());
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

        await testStore.dispatch(Actions.addUsersToChannel(fakeData.channel, fakeData.userIds));
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

        await testStore.dispatch(Actions.openDirectChannelToUserId(fakeData.userId));
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
                meta: {
                    offline: {
                        commit: {
                            type: 'RECEIVED_PREFERENCES',
                        },
                        effect: null,
                        rollback: {
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
                            type: 'DELETED_PREFERENCES',
                        },
                    },
                },
                type: 'RECEIVED_PREFERENCES',
            },
        ];
        const fakeData = {
            userId: 'existingId',
        };

        await testStore.dispatch(Actions.openDirectChannelToUserId(fakeData.userId));

        const doneActions = testStore.getActions();
        doneActions[1].meta.offline.effect = null;
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

        await testStore.dispatch(Actions.openGroupChannelToUserIds(fakeData.userIds));
        expect(testStore.getActions()).toEqual(expectedActions);
    });
});
