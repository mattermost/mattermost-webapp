// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {TestHelper} from 'utils/test_helper';

import {isFirstReply} from './index';

describe('isFirstReply', () => {
    for (const testCase of [
        {
            name: 'a post with nothing above it',
            post: TestHelper.getPostMock({root_id: ''}),
            previousPost: null,
            expected: false,
        },
        {
            name: 'a comment with nothing above it',
            post: TestHelper.getPostMock({root_id: 'root'}),
            previousPost: null,
            expected: true,
        },
        {
            name: 'a post with a regular post above it',
            post: TestHelper.getPostMock({root_id: ''}),
            previousPost: TestHelper.getPostMock({root_id: ''}),
            expected: false,
        },
        {
            name: 'a post with a comment above it',
            post: TestHelper.getPostMock({root_id: ''}),
            previousPost: TestHelper.getPostMock({root_id: 'root'}),
            expected: false,
        },
        {
            name: 'a comment with a regular post above it',
            post: TestHelper.getPostMock({root_id: 'root1'}),
            previousPost: TestHelper.getPostMock({root_id: ''}),
            expected: true,
        },
        {
            name: 'a comment with a comment on another thread above it',
            post: TestHelper.getPostMock({root_id: 'root1'}),
            previousPost: TestHelper.getPostMock({root_id: 'root2'}),
            expected: true,
        },
        {
            name: 'a comment with a comment on the same thread above it',
            post: TestHelper.getPostMock({root_id: 'root1'}),
            previousPost: TestHelper.getPostMock({root_id: 'root1'}),
            expected: false,
        },
        {
            name: 'a comment with its parent above it',
            post: TestHelper.getPostMock({root_id: 'root1'}),
            previousPost: TestHelper.getPostMock({root_id: 'root1'}),
            expected: false,
        },
    ]) {
        test(testCase.name, () => {
            expect(isFirstReply(testCase.post, testCase.previousPost)).toBe(testCase.expected);
        });
    }
});
