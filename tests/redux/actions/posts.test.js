// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import assert from 'assert';

import * as Actions from 'actions/post_actions';

import configureStore from 'store'

describe('Actions.Posts', () => {
    beforeEach(async () => {
        store = await configureStore();
    });

    it('setEditingPost', async () => {
        await Actions.setEditingPost('123', 0, 'test', 'title')(store.dispatch, store.getState);
        assert.deepEqual(
            store.getState().views.posts.editingPost,
            {
                postId: '123',
                commentsCount: 0,
                refocusId: 'test',
                title: 'title'
            }
        );
        await Actions.setEditingPost('456', 3, 'test2', 'title2')(store.dispatch, store.getState);
        assert.deepEqual(
            store.getState().views.posts.editingPost,
            {
                postId: '456',
                commentsCount: 3,
                refocusId: 'test2',
                title: 'title2'
            }
        );
    });
});
