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

describe('components/SwitchChannelProvider', () => {
    it('should change name on wrapper to be unique with same name user channel and public channel', () => {
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
                    channels: {}
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
            },
        };

        const switchProvider = new SwitchChannelProvider();
        const mockStore = configureStore();
        const resultsCallback = jest.fn();
        const store = mockStore(defaultState);

        getState.mockImplementation(store.getState);

        const users = [
            {
                id: 'other_user',
                display_name: 'other_user',
                username: 'other_user',
            },
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
                    channels: {},
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
            },
        };

        const switchProvider = new SwitchChannelProvider();
        const mockStore = configureStore();
        const resultsCallback = jest.fn();
        const store = mockStore(defaultState);

        getState.mockImplementation(store.getState);

        const users = [{
            id: 'other_user',
            display_name: 'other_user',
            username: 'other_user',
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
            },
        };

        const switchProvider = new SwitchChannelProvider();
        const mockStore = configureStore();
        const resultsCallback = jest.fn();
        const store = mockStore(defaultState);

        getState.mockImplementation(store.getState);

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

    it('should correctly format the display name depending on the preferences', () => {
        const switchProvider = new SwitchChannelProvider();

        const user = {
            id: 'id',
            username: 'username',
            first_name: 'fn',
            last_name: 'ln',
        };
        const channel = {
            id: 'channel_id',
        };

        let res = switchProvider.userWrappedChannel(user, channel);
        expect(res.channel.display_name).toEqual('@username - fn ln');

        getState.mockClear();

        const mockStore = configureStore();
        const store = mockStore({
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
                            value: 'full_name',
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
            },
        });
        getState.mockImplementation(store.getState);

        res = switchProvider.userWrappedChannel(user, channel);
        expect(res.channel.display_name).toEqual('fn ln - @username');
    });

    it('should sort results in aplhabetical order', () => {
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
                    channels: {},
                },
                preferences: {
                    myPreferences: {},
                },
                users: {
                    profiles: {
                        current_user_id: {roles: 'system_role'},
                        other_user1: {
                            name: 'other_user1',
                            first_name: 'other',
                            last_name: 'user1',
                            id: 'other_user1',
                        },
                    },
                    currentUserId: 'current_user_id',
                    profilesInChannel: {
                        current_user_id: ['user_1'],
                    },
                },
            },
        };

        const switchProvider = new SwitchChannelProvider();
        const mockStore = configureStore();
        const resultsCallback = jest.fn();
        const store = mockStore(defaultState);

        getState.mockImplementation(store.getState);

        const users = [
            {
                id: 'other_user1',
                display_name: 'other_user1',
                username: 'other_user1',
            },
            {
                id: 'other_user2',
                display_name: 'other_user2',
                username: 'other_user2',
            },
            {
                id: 'other_user4',
                display_name: 'other_user4',
                username: 'other_user4',
            },
            {
                id: 'other_user3',
                display_name: 'other_user3',
                username: 'other_user3',
            },
        ];

        const channels = [{
            id: 'channel_other_user',
            type: 'O',
            name: 'blah_other_user',
            display_name: 'blah_other_user',
            delete_at: 0,
        }, {
            id: 'direct_other_user1',
            type: 'D',
            name: 'current_user_id__other_user1',
            display_name: 'other_user1',
            delete_at: 0,
        }, {
            id: 'direct_other_user2',
            type: 'D',
            name: 'current_user_id__other_user2',
            display_name: 'other_user2',
            delete_at: 0,
        }];
        const searchText = 'other';

        switchProvider.startNewRequest();
        switchProvider.formatChannelsAndDispatch(searchText, resultsCallback, channels, users);

        expect(resultsCallback).toHaveBeenCalled();
        const expectedOrder = [
            'channel_other_user', //open channels are at thetop ofthe list
            'direct_other_user1',
            'direct_other_user2',
            'other_user3',
            'other_user4',
        ];

        const wrappers = resultsCallback.mock.calls[0][0];
        expect(wrappers.terms).toEqual(expectedOrder);
    });

    it('should sort results based on last_viewed_at order followed by alphabetical', () => {
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
                            last_viewed_at: 1,
                        },
                        direct_other_user1: {
                            channel_id: 'direct_other_user1',
                            msg_count: 1,
                            last_viewed_at: 2,
                        },
                        direct_other_user4: {
                            channel_id: 'direct_other_user4',
                            msg_count: 1,
                            last_viewed_at: 3,
                        },
                    },
                    channels: {},
                },
                preferences: {
                    myPreferences: {},
                },
                users: {
                    profiles: {
                        current_user_id: {roles: 'system_role'},
                        other_user1: {
                            name: 'other_user1',
                            first_name: 'other',
                            last_name: 'user1',
                            id: 'other_user1',
                        },
                    },
                    currentUserId: 'current_user_id',
                    profilesInChannel: {
                        current_user_id: ['user_1'],
                    },
                },
            },
        };

        const switchProvider = new SwitchChannelProvider();
        const mockStore = configureStore();
        const resultsCallback = jest.fn();
        const store = mockStore(defaultState);

        getState.mockImplementation(store.getState);

        const users = [
            {
                id: 'other_user1',
                display_name: 'other_user1',
                username: 'other_user1',
            },
            {
                id: 'other_user2',
                display_name: 'other_user2',
                username: 'other_user2',
            },
            {
                id: 'other_user4',
                display_name: 'other_user4',
                username: 'other_user4',
            },
            {
                id: 'other_user3',
                display_name: 'other_user3',
                username: 'other_user3',
            },
        ];

        const channels = [{
            id: 'channel_other_user',
            type: 'O',
            name: 'blah_other_user',
            display_name: 'blah_other_user',
            delete_at: 0,
        }, {
            id: 'direct_other_user1',
            type: 'D',
            name: 'current_user_id__other_user1',
            display_name: 'other_user1',
            delete_at: 0,
        }, {
            id: 'direct_other_user2',
            type: 'D',
            name: 'current_user_id__other_user2',
            display_name: 'other_user2',
            delete_at: 0,
        }, {
            id: 'direct_other_user4',
            type: 'D',
            name: 'current_user_id__other_user4',
            display_name: 'other_user4',
            delete_at: 0,
        }];

        const searchText = 'other';

        switchProvider.startNewRequest();
        switchProvider.formatChannelsAndDispatch(searchText, resultsCallback, channels, users);

        expect(resultsCallback).toHaveBeenCalled();
        const expectedOrder = [
            'direct_other_user4',
            'direct_other_user1',
            'channel_other_user',
            'direct_other_user2',
            'other_user3',
        ];

        const wrappers = resultsCallback.mock.calls[0][0];
        expect(wrappers.terms).toEqual(expectedOrder);
    });
});
