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
});
