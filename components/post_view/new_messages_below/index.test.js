// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Posts} from 'mattermost-redux/constants';

import {makeCountUnreadsBelow} from './index';

describe('makeCountUnreadsBelow', () => {
    test('should only count new posts', () => {
        const countUnreadsBelow = makeCountUnreadsBelow();

        const state = {
            entities: {
                posts: {
                    posts: {
                        post1: {create_at: 1000},
                        post2: {create_at: 2000},
                        post3: {create_at: 3000},
                        post4: {create_at: 4000},
                    },
                },
                users: {
                    currentUserId: 'user1',
                },
            },
        };
        const postIds = ['post1', 'post2', 'post3', 'post4'];

        expect(countUnreadsBelow(state, postIds, 1500)).toBe(3);
        expect(countUnreadsBelow(state, postIds, 2500)).toBe(2);
        expect(countUnreadsBelow(state, postIds, 4000)).toBe(0);
    });

    test('should not count deleted posts', () => {
        const countUnreadsBelow = makeCountUnreadsBelow();

        const state = {
            entities: {
                posts: {
                    posts: {
                        post1: {create_at: 1000, state: Posts.POST_DELETED},
                        post2: {create_at: 2000},
                        post3: {create_at: 3000, state: Posts.POST_DELETED},
                        post4: {create_at: 4000},
                    },
                },
                users: {
                    currentUserId: 'user1',
                },
            },
        };
        const postIds = ['post1', 'post2', 'post3', 'post4'];

        expect(countUnreadsBelow(state, postIds, 500)).toBe(2);
        expect(countUnreadsBelow(state, postIds, 2500)).toBe(1);
    });

    test('should not count posts made by the current user', () => {
        const countUnreadsBelow = makeCountUnreadsBelow();

        const state = {
            entities: {
                posts: {
                    posts: {
                        post1: {create_at: 1000, user_id: 'user1'},
                        post2: {create_at: 2000},
                        post3: {create_at: 3000},
                        post4: {create_at: 4000, user_id: 'user1'},
                    },
                },
                users: {
                    currentUserId: 'user1',
                },
            },
        };
        const postIds = ['post1', 'post2', 'post3', 'post4'];

        expect(countUnreadsBelow(state, postIds, 500)).toBe(2);
        expect(countUnreadsBelow(state, postIds, 2500)).toBe(1);
    });
});
