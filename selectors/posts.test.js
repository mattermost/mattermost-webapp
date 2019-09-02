// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Posts} from 'mattermost-redux/constants';
import * as PostListUtils from 'mattermost-redux/utils/post_list';

import {makeCombineUserActivityFromPosts} from './posts';

describe('makeCombineUserActivityFromPosts', () => {
    test('should do nothing if no post IDs are provided', () => {
        const combineUserActivityPosts = makeCombineUserActivityFromPosts();

        const posts = [];

        const result = combineUserActivityPosts(posts);

        expect(result).toBe(posts);
        expect(result).toEqual([]);
    });

    test('should do nothing if there are no user activity posts', () => {
        const combineUserActivityPosts = makeCombineUserActivityFromPosts();
        const posts = [
            {id: 'post1'},
            {id: 'post2'},
            {id: 'post3'},
        ];
        const result = combineUserActivityPosts(posts);

        expect(result).toBe(posts);
    });

    test('should combine adjacent user activity posts', () => {
        const combineUserActivityPosts = makeCombineUserActivityFromPosts();

        const posts = [
            {id: 'post1', type: Posts.POST_TYPES.JOIN_CHANNEL},
            {id: 'post2', type: Posts.POST_TYPES.LEAVE_CHANNEL},
            {id: 'post3', type: Posts.POST_TYPES.ADD_TO_CHANNEL},
        ];

        const result = combineUserActivityPosts(posts);

        expect(result).not.toBe(posts);
        expect(result).toEqual([
            {id: PostListUtils.COMBINED_USER_ACTIVITY + 'post1_post2_post3', type: Posts.POST_TYPES.JOIN_CHANNEL},
        ]);
    });

    test('should not combine with regular messages', () => {
        const combineUserActivityPosts = makeCombineUserActivityFromPosts();

        const posts = [
            {id: 'post1', type: Posts.POST_TYPES.JOIN_CHANNEL},
            {id: 'post2', type: Posts.POST_TYPES.JOIN_CHANNEL},
            {id: 'post3'},
            {id: 'post4', type: Posts.POST_TYPES.ADD_TO_CHANNEL},
            {id: 'post5', type: Posts.POST_TYPES.ADD_TO_CHANNEL},
        ];

        const result = combineUserActivityPosts(posts);

        expect(result).not.toBe(posts);
        expect(result).toEqual([
            {id: PostListUtils.COMBINED_USER_ACTIVITY + 'post1_post2', type: Posts.POST_TYPES.JOIN_CHANNEL},
            {id: 'post3'},
            {id: PostListUtils.COMBINED_USER_ACTIVITY + 'post4_post5', type: Posts.POST_TYPES.ADD_TO_CHANNEL},
        ]);
    });

    test('should not combine more than 100 posts', () => {
        const combineUserActivityPosts = makeCombineUserActivityFromPosts();

        const posts = [];
        for (let i = 0; i < 110; i++) {
            const postId = `post${i}`;
            posts.push({id: postId, type: Posts.POST_TYPES.JOIN_CHANNEL});
        }

        const result = combineUserActivityPosts(posts);

        expect(result).toHaveLength(2);
    });
});
