// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Posts} from 'mattermost-redux/constants';

import {makeGetReplyCount} from './index';

describe('makeGetReplyCount', () => {
    test('should return the number of comments when called on a root post', () => {
        const getReplyCount = makeGetReplyCount();

        const state = {
            entities: {
                posts: {
                    posts: {
                        post1: {id: 'post1'},
                        post2: {id: 'post2', root_id: 'post1'},
                        post3: {id: 'post3', root_id: 'post1'},
                    },
                    postsInThread: {
                        post1: ['post2', 'post3'],
                    },
                },
            },
        };
        const post = state.entities.posts.posts.post1;

        expect(getReplyCount(state, post)).toBe(2);
    });

    test('should return the number of comments when called on a comment', () => {
        const getReplyCount = makeGetReplyCount();

        const state = {
            entities: {
                posts: {
                    posts: {
                        post1: {id: 'post1'},
                        post2: {id: 'post2', root_id: 'post1'},
                        post3: {id: 'post3', root_id: 'post1'},
                    },
                    postsInThread: {
                        post1: ['post2', 'post3'],
                    },
                },
            },
        };
        const post = state.entities.posts.posts.post3;

        expect(getReplyCount(state, post)).toBe(2);
    });

    test('should return 0 when called on a post without comments', () => {
        const getReplyCount = makeGetReplyCount();

        const state = {
            entities: {
                posts: {
                    posts: {
                        post1: {id: 'post1'},
                    },
                    postsInThread: {},
                },
            },
        };
        const post = state.entities.posts.posts.post1;

        expect(getReplyCount(state, post)).toBe(0);
    });

    test('should not count ephemeral comments', () => {
        const getReplyCount = makeGetReplyCount();

        const state = {
            entities: {
                posts: {
                    posts: {
                        post1: {id: 'post1'},
                        post2: {id: 'post2', root_id: 'post1', type: Posts.POST_TYPES.EPHEMERAL},
                        post3: {id: 'post3', root_id: 'post1'},
                    },
                    postsInThread: {
                        post1: ['post2', 'post3'],
                    },
                },
            },
        };
        const post = state.entities.posts.posts.post1;

        expect(getReplyCount(state, post)).toBe(1);
    });
});
