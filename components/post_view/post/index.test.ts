// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post} from '@mattermost/types/posts';

import {isFirstReply} from './index';

function makePost(id: string): Post {
    return {root_id: id} as Post;
}

describe('isFirstReply', () => {
    for (const testCase of [
        {
            name: 'a post with nothing above it',
            post: makePost(''),
            previousPost: null,
            expected: false,
        },
        {
            name: 'a comment with nothing above it',
            post: makePost('root'),
            previousPost: null,
            expected: true,
        },
        {
            name: 'a post with a regular post above it',
            post: makePost(''),
            previousPost: makePost(''),
            expected: false,
        },
        {
            name: 'a post with a comment above it',
            post: makePost(''),
            previousPost: makePost('root'),
            expected: false,
        },
        {
            name: 'a comment with a regular post above it',
            post: makePost('root1'),
            previousPost: makePost(''),
            expected: true,
        },
        {
            name: 'a comment with a comment on another thread above it',
            post: makePost('root1'),
            previousPost: makePost('root2'),
            expected: true,
        },
        {
            name: 'a comment with a comment on the same thread above it',
            post: makePost('root1'),
            previousPost: makePost('root1'),
            expected: false,
        },
        {
            name: 'a comment with its parent above it',
            post: makePost('root1'),
            previousPost: makePost('root1'),
            expected: false,
        },
    ]) {
        test(testCase.name, () => {
            expect(isFirstReply(testCase.post, testCase.previousPost)).toBe(testCase.expected);
        });
    }
});
