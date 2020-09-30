// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {setCategoryCollapsed} from 'actions/views/channel_sidebar';

import configureStore from 'store';

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
    const unreadChannel1 = {id: 'unreadChannel1', total_msg_count: 10, last_post_at: 100};
    const unreadChannel2 = {id: 'unreadChannel2', total_msg_count: 10, last_post_at: 200};
    const readChannel = {id: 'readChannel', total_msg_count: 10, last_post_at: 300};

    const baseState = {
        entities: {
            channels: {
                channels: {
                    unreadChannel1,
                    unreadChannel2,
                    readChannel,
                },
                channelsInTeam: {
                    team1: ['unreadChannel1', 'unreadChannel2', 'readChannel'],
                },
                currentChannelId: 'unreadChannel1',
                myMembers: {
                    unreadChannel1: {notify_props: {}, mention_count: 0, msg_count: 8},
                    unreadChannel2: {notify_props: {}, mention_count: 0, msg_count: 8},
                    readChannel: {notify_props: {}, mention_count: 0, msg_count: 10},
                },
            },
            posts: {
                postsInChannel: {},
            },
            teams: {
                currentTeamId: 'team1',
            },
        },
    };

    test('should return channels sorted by recency', () => {
        expect(Selectors.getUnreadChannels(baseState)).toEqual([unreadChannel2, unreadChannel1]);
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
            },
        };

        expect(Selectors.getUnreadChannels(state)).toEqual([unreadChannel1, unreadChannel2]);

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
            },
        };

        expect(Selectors.getUnreadChannels(state)).toEqual([unreadChannel2, unreadChannel1]);
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
            },
        };

        expect(Selectors.getUnreadChannels(state)).toEqual([readChannel, unreadChannel2, unreadChannel1]);
    });
});
