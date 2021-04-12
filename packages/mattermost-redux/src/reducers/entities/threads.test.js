// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {TeamTypes, ThreadTypes} from 'mattermost-redux/action_types';
import deepFreeze from 'mattermost-redux/utils/deep_freeze';

import threadsReducer from './threads';

describe('threads', () => {
    test('RECEIVED_THREADS should update the state', () => {
        const state = deepFreeze({
            threadsInTeam: {},
            threads: {},
            counts: {},
        });

        const nextState = threadsReducer(state, {
            type: ThreadTypes.RECEIVED_THREADS,
            data: {
                team_id: 'a',
                threads: [
                    {id: 't1'},
                ],
                total: 3,
                unread_mentions_per_channel: {},
                total_unread_threads: 0,
                total_unread_mentions: 1,
            },
        });

        expect(nextState).not.toBe(state);
        expect(nextState.threads.t1).toEqual({
            id: 't1',
        });
        expect(nextState.counts.a).toEqual({
            total: 3,
            total_unread_threads: 0,
            unread_mentions_per_channel: {},
            total_unread_mentions: 1,
        });
        expect(nextState.threadsInTeam.a).toContain('t1');
    });
    test('ALL_TEAM_THREADS_READ should clear the counts', () => {
        const state = deepFreeze({
            threadsInTeam: {},
            threads: {},
            counts: {
                a: {
                    total: 3,
                    total_unread_threads: 0,
                    total_unread_mentions: 2,
                },
            },
        });
        const nextState2 = threadsReducer(state, {
            type: ThreadTypes.ALL_TEAM_THREADS_READ,
            data: {
                team_id: 'a',
            },
        });

        expect(nextState2).not.toBe(state);
        expect(nextState2.counts.a).toEqual({
            total: 3,
            total_unread_threads: 0,
            unread_mentions_per_channel: {},
            total_unread_mentions: 0,
        });
    });

    test('READ_CHANGED_THREAD should update the count for thread per channel', () => {
        const state = deepFreeze({
            threadsInTeam: {},
            threads: {},
            counts: {
                a: {
                    unread_mentions_per_channel: {
                        a: 3,
                    },
                    total: 3,
                    total_unread_threads: 1,
                    total_unread_mentions: 3,
                },
            },
        });
        const nextState2 = threadsReducer(state, {
            type: ThreadTypes.READ_CHANGED_THREAD,
            data: {
                teamId: 'a',
                prevUnreadMentions: 3,
                newUnreadMentions: 0,
                channelId: 'a',
            },
        });

        expect(nextState2).not.toBe(state);
        expect(nextState2.counts.a).toEqual({
            total: 3,
            total_unread_threads: 1,
            unread_mentions_per_channel: {
                a: 0,
            },
            total_unread_mentions: 0,
        });

        const nextState3 = threadsReducer(nextState2, {
            type: ThreadTypes.READ_CHANGED_THREAD,
            data: {
                teamId: 'a',
                prevUnreadMentions: 0,
                newUnreadMentions: 3,
                channelId: 'a',
            },
        });

        expect(nextState3).not.toBe(nextState2);
        expect(nextState3.counts.a).toEqual({
            total: 3,
            total_unread_threads: 1,
            unread_mentions_per_channel: {
                a: 3,
            },
            total_unread_mentions: 3,
        });
    });
    test('RECEIVED_PER_CHANNEL_MENTION_COUNTS should update the state', () => {
        const state = deepFreeze({
            threadsInTeam: {},
            threads: {},
            counts: {
                a: {
                    total: 3,
                    total_unread_threads: 0,
                    total_unread_mentions: 2,
                },
            },
        });

        const nextState = threadsReducer(state, {
            type: ThreadTypes.RECEIVED_PER_CHANNEL_MENTION_COUNTS,
            data: {
                team_id: 'a',
                counts: {a: 2},
            },
        });

        expect(nextState).not.toBe(state);
        expect(nextState.counts.a).toEqual({
            total: 3,
            total_unread_threads: 0,
            unread_mentions_per_channel: {a: 2},
            total_unread_mentions: 2,
        });
    });
    test('LEAVE_TEAM should clean the state', () => {
        const state = deepFreeze({
            threadsInTeam: {},
            threads: {},
            counts: {},
        });

        let nextState = threadsReducer(state, {
            type: ThreadTypes.RECEIVED_THREADS,
            data: {
                team_id: 'a',
                threads: [
                    {id: 't1'},
                ],
                total: 3,
                unread_mentions_per_channel: {},
                total_unread_threads: 0,
                total_unread_mentions: 1,
            },
        });

        expect(nextState).not.toBe(state);

        // leave team
        nextState = threadsReducer(state, {
            type: TeamTypes.LEAVE_TEAM,
            data: {
                id: 'a',
            },
        });

        expect(nextState.threads.t1).toBe(undefined);
        expect(nextState.counts.a).toBe(undefined);
        expect(nextState.threadsInTeam.a).toBe(undefined);
    });
});
