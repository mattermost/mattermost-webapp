// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {setCategoryCollapsed} from 'actions/views/channel_sidebar';

import configureStore from 'store';

import {TestHelper} from 'utils/test_helper';

import * as Selectors from './channel_sidebar';

describe('isCategoryCollapsed', () => {
    const category1 = 'category1';
    const category2 = 'category2';

    test('should return false by default', async () => {
        const store = await configureStore();

        expect(Selectors.isCategoryCollapsed(store.getState(), category1)).toBe(false);
        expect(Selectors.isCategoryCollapsed(store.getState(), category2)).toBe(false);
    });

    test('should return true when category is explicitly collapsed', async () => {
        const store = await configureStore();

        await store.dispatch(setCategoryCollapsed(category1, true));

        expect(Selectors.isCategoryCollapsed(store.getState(), category1)).toBe(true);
        expect(Selectors.isCategoryCollapsed(store.getState(), category2)).toBe(false);

        await store.dispatch(setCategoryCollapsed(category1, false));

        expect(Selectors.isCategoryCollapsed(store.getState(), category1)).toBe(false);
        expect(Selectors.isCategoryCollapsed(store.getState(), category2)).toBe(false);
    });
});

describe('getUnreadChannels', () => {
    const currentChannel = TestHelper.getChannelMock({id: 'currentChannel', delete_at: 0, total_msg_count: 0, last_post_at: 0});
    const readChannel = {id: 'readChannel', delete_at: 0, total_msg_count: 10, last_post_at: 300};
    const unreadChannel1 = {id: 'unreadChannel1', delete_at: 0, total_msg_count: 10, last_post_at: 100};
    const unreadChannel2 = {id: 'unreadChannel2', delete_at: 0, total_msg_count: 10, last_post_at: 200};

    const baseState = {
        entities: {
            channels: {
                channels: {
                    currentChannel,
                    readChannel,
                    unreadChannel1,
                    unreadChannel2,
                },
                channelsInTeam: {
                    team1: ['unreadChannel1', 'unreadChannel2', 'readChannel'],
                },
                currentChannelId: 'currentChannel',
                myMembers: {
                    currentChannel: {notify_props: {}, mention_count: 0, msg_count: 0},
                    readChannel: {notify_props: {}, mention_count: 0, msg_count: 10},
                    unreadChannel1: {notify_props: {}, mention_count: 0, msg_count: 8},
                    unreadChannel2: {notify_props: {}, mention_count: 0, msg_count: 8},
                },
            },
            posts: {
                postsInChannel: {},
            },
            teams: {
                currentTeamId: 'team1',
            },
            general: {
                config: {
                    test: true,
                },
            },
            preferences: {
                myPreferences: {},
            },
        },
        views: {
            channel: {
                lastUnreadChannel: {
                    id: 'currentChannel',
                    hadMentions: false,
                },
            },
        },
    };

    test('should return channels sorted by recency', () => {
        expect(Selectors.getUnreadChannels(baseState)).toEqual([unreadChannel2, unreadChannel1, currentChannel]);
    });

    test('should return channels with mentions before those without', () => {
        let state = {
            ...baseState,
            entities: {
                ...baseState.entities,
                channels: {
                    ...baseState.entities.channels,
                    myMembers: {
                        ...baseState.entities.channels.myMembers,
                        unreadChannel1: {notify_props: {}, mention_count: 2, msg_count: 8},
                    },
                },
                general: {
                    ...baseState.entities.general,
                },
                preferences: {
                    ...baseState.entities.preferences,
                },
            },
        };

        expect(Selectors.getUnreadChannels(state)).toEqual([unreadChannel1, unreadChannel2, currentChannel]);

        state = {
            ...baseState,
            entities: {
                ...baseState.entities,
                channels: {
                    ...baseState.entities.channels,
                    myMembers: {
                        ...baseState.entities.channels.myMembers,
                        unreadChannel1: {notify_props: {}, mention_count: 2, msg_count: 8},
                        unreadChannel2: {notify_props: {}, mention_count: 1, msg_count: 8},
                    },
                },
                general: {
                    ...baseState.entities.general,
                },
                preferences: {
                    ...baseState.entities.preferences,
                },
            },
        };

        expect(Selectors.getUnreadChannels(state)).toEqual([unreadChannel2, unreadChannel1, currentChannel]);
    });

    test('should always return the current channel, even if it is not unread', () => {
        const state = {
            ...baseState,
            entities: {
                ...baseState.entities,
                channels: {
                    ...baseState.entities.channels,
                    currentChannelId: 'readChannel',
                },
                general: {
                    ...baseState.entities.general,
                },
                preferences: {
                    ...baseState.entities.preferences,
                },
            },
        };

        expect(Selectors.getUnreadChannels(state)).toEqual([readChannel, unreadChannel2, unreadChannel1]);
    });

    test('should look at lastUnreadChannel to determine if the current channel had mentions before it was read', () => {
        let state = {
            ...baseState,
            entities: {
                ...baseState.entities,
                channels: {
                    ...baseState.entities.channels,
                    currentChannelId: 'readChannel',
                    myMembers: {
                        ...baseState.entities.channels.myMembers,
                        unreadChannel1: {notify_props: {}, mention_count: 2, msg_count: 8},
                    },
                },
                general: {
                    ...baseState.entities.general,
                },
                preferences: {
                    ...baseState.entities.preferences,
                },
            },
            views: {
                ...baseState.views,
                channel: {
                    ...baseState.views.channel,
                    lastUnreadChannel: {
                        id: 'readChannel',
                        hadMentions: false,
                    },
                },
            },
        };

        // readChannel previously had no mentions, so it should be sorted with the non-mentions
        expect(Selectors.getUnreadChannels(state)).toEqual([unreadChannel1, readChannel, unreadChannel2]);

        state = {
            ...state,
            views: {
                ...state.views,
                channel: {
                    ...state.views.channel,
                    lastUnreadChannel: {
                        id: 'readChannel',
                        hadMentions: true,
                    },
                },
            },
        };

        // readChannel previously had a mention, so it should be sorted with the mentions
        expect(Selectors.getUnreadChannels(state)).toEqual([readChannel, unreadChannel1, unreadChannel2]);
    });

    test('should sort muted channels last', () => {
        let state = {
            ...baseState,
            entities: {
                ...baseState.entities,
                channels: {
                    ...baseState.entities.channels,
                    myMembers: {
                        ...baseState.entities.channels.myMembers,
                        unreadChannel2: {notify_props: {mark_unread: 'all'}, total_msg_count: 10, mention_count: 2},
                    },
                },
                general: {
                    ...baseState.entities.general,
                },
                preferences: {
                    ...baseState.entities.preferences,
                },
            },
        };

        // No channels are muted
        expect(Selectors.getUnreadChannels(state)).toEqual([unreadChannel2, unreadChannel1, currentChannel]);

        state = {
            ...state,
            entities: {
                ...state.entities,
                channels: {
                    ...state.entities.channels,
                    myMembers: {
                        ...state.entities.channels.myMembers,
                        unreadChannel2: {notify_props: {mark_unread: 'mention'}, total_msg_count: 10, mention_count: 2},
                    },
                },
                general: {
                    ...baseState.entities.general,
                },
                preferences: {
                    ...baseState.entities.preferences,
                },
            },
        };

        // unreadChannel2 is muted and has a mention
        expect(Selectors.getUnreadChannels(state)).toEqual([unreadChannel1, currentChannel, unreadChannel2]);
    });

    test('should not show archived channels unless they are the current channel', () => {
        const archivedChannel = {id: 'archivedChannel', delete_at: 1, total_msg_count: 10, last_post_at: 400};

        let state = {
            ...baseState,
            entities: {
                ...baseState.entities,
                channels: {
                    ...baseState.entities.channels,
                    channels: {
                        ...baseState.entities.channels.channels,
                        archivedChannel,
                    },
                    channelsInTeam: {
                        ...baseState.entities.channels.channelsInTeam,
                        team1: [
                            ...baseState.entities.channels.channelsInTeam.team1,
                            'archivedChannel',
                        ],
                    },
                    myMembers: {
                        ...baseState.entities.channels.myMembers,
                        archivedChannel: {notify_props: {}, mention_count: 0, msg_count: 0},
                    },
                },
            },
        };

        expect(Selectors.getUnreadChannels(state)).toEqual([unreadChannel2, unreadChannel1, currentChannel]);

        state = {
            ...state,
            entities: {
                ...state.entities,
                channels: {
                    ...state.entities.channels,
                    currentChannelId: 'archivedChannel',
                },
            },
        };

        expect(Selectors.getUnreadChannels(state)).toEqual([archivedChannel, unreadChannel2, unreadChannel1]);
    });
});
