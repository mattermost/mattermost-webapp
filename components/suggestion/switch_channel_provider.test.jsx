// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import configureStore from 'redux-mock-store';

import {getState} from 'stores/redux_store';

import SwitchChannelProvider from 'components/suggestion/switch_channel_provider.jsx';

jest.mock('stores/redux_store', () => ({
    dispatch: jest.fn(),
    getState: jest.fn(),
}));

jest.mock('mattermost-redux/utils/channel_utils', () => ({
    ...jest.requireActual('mattermost-redux/utils/channel_utils'),
    isGroupChannelVisible: jest.fn(() => true),
    isDirectChannelVisible: jest.fn(() => true),
    isUnreadChannel: jest.fn(() => false),
}));

const latestPost = {
    id: 'latest_post_id',
    user_id: 'current_user_id',
    message: 'test msg',
    channel_id: 'current_channel_id',
};

describe('components/SwitchChannelProvider', () => {
    const defaultState = {
        entities: {
            general: {
                config: {},
            },
            channels: {
                myMembers: {
                    current_channel_id: {
                        channel_id: 'current_channel_id',
                        user_id: 'current_user_id',
                        roles: 'channel_role',
                        mention_count: 1,
                        msg_count: 9,
                    },
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
            users: {
                profiles: {
                    current_user_id: {roles: 'system_role'},
                },
                currentUserId: 'current_user_id',
                profilesInChannel: {
                    current_user_id: ['user_1'],
                },
            },
            posts: {
                posts: {
                    [latestPost.id]: latestPost,
                },
                postsInChannel: {
                    current_channel_id: [
                        {order: [latestPost.id], recent: true},
                    ],
                },
                postsInThread: {},
            },
        },
    };

    const switchProvider = new SwitchChannelProvider();
    const mockStore = configureStore();
    const resultsCallback = jest.fn();
    const store = mockStore(defaultState);

    getState.mockImplementation(store.getState);

    it('should change name on wrapper to be unique with same name user channel and public channel', () => {
        const users = [
            {
                id: 'other_user',
                display_name: 'other_user',
                username: 'other_user'
            }
        ];
        const channels = [{
            id: 'channel_other_user',
            type: 'O',
            name: 'other_user',
            display_name: 'other_user',
            delete_at: 0,
        },
        {
            id: 'direct_other_user',
            type: 'D',
            name: 'current_user_id__other_user',
            display_name: 'other_user',
            delete_at: 0,
        }];
        const searchText = 'other';

        switchProvider.startNewRequest();
        switchProvider.formatChannelsAndDispatch(searchText, resultsCallback, channels, users);

        expect(resultsCallback).toHaveBeenCalled();

        const wrappers = resultsCallback.mock.calls[0][0];
        var set = new Set(wrappers.terms);
        expect(set.size).toEqual(wrappers.items.length);

        var set2 = new Set(wrappers.items.map((o) => o.channel.name));
        expect(set2.size).toEqual(1);
        expect(wrappers.items.length).toEqual(2);
    });

    it('should change name on wrapper to be unique with same name user in channel and public channel', () => {
        const users = [{
            id: 'other_user',
            display_name: 'other_user',
            username: 'other_user'
        },
        ];
        const channels = [{
            id: 'channel_other_user',
            type: 'O',
            name: 'other_user',
            display_name: 'other_user',
            delete_at: 0,
        },
        ];
        const searchText = 'other';

        switchProvider.startNewRequest();
        switchProvider.formatChannelsAndDispatch(searchText, resultsCallback, channels, users);

        expect(resultsCallback).toHaveBeenCalled();

        const wrappers = resultsCallback.mock.calls[0][0];
        var set = new Set(wrappers.terms);
        expect(set.size).toEqual(wrappers.items.length);

        var set2 = new Set(wrappers.items.map((o) => o.channel.name));
        expect(set2.size).toEqual(1);
        expect(wrappers.items.length).toEqual(2);
    });

    it('should not fail if nothing matches', () => {
        const users = [];
        const channels = [{
            id: 'channel_other_user',
            type: 'O',
            name: 'other_user',
            display_name: 'other_user',
            delete_at: 0,
        },
        {
            id: 'direct_other_user',
            type: 'D',
            name: 'current_user_id__other_user',
            display_name: 'other_user',
            delete_at: 0,
        }];
        const searchText = 'something else';

        switchProvider.startNewRequest();
        switchProvider.formatChannelsAndDispatch(searchText, resultsCallback, channels, users);

        expect(resultsCallback).toHaveBeenCalled();
        const wrappers = resultsCallback.mock.calls[0][0];
        expect(wrappers.terms.length).toEqual(0);
        expect(wrappers.items.length).toEqual(0);
    });
});