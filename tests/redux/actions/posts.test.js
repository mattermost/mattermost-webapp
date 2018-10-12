// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {Posts} from 'mattermost-redux/constants';

import * as Actions from 'actions/post_actions';
import {Constants, ActionTypes} from 'utils/constants';

const mockStore = configureStore([thunk]);

describe('Actions.Posts', () => {
    const latestPost = {
        id: 'latest_post_id',
        user_id: 'current_user_id',
        message: 'test msg',
        channel_id: 'current_channel_id',
    };
    const initialState = {
        entities: {
            posts: {
                posts: {
                    [latestPost.id]: latestPost,
                },
                postsInChannel: {
                    current_channel_id: [latestPost.id],
                },
                postsInThread: {},
                messagesHistory: {
                    index: {
                        [Posts.MESSAGE_TYPES.COMMENT]: 0,
                    },
                    messages: ['test message'],
                },
            },
            general: {license: {IsLicensed: 'false'}},
        },
        views: {
            posts: {
                editingPost: {},
            },
        },
    };

    test('setEditingPost', async () => {
        // should allow to edit and should fire an action
        let testStore = mockStore({...initialState});
        const {data} = await testStore.dispatch(Actions.setEditingPost('latest_post_id', 0, 'test', 'title'));
        expect(data).toEqual(true);

        expect(testStore.getActions()).toEqual(
            [{data: {commentCount: 0, isRHS: false, postId: 'latest_post_id', refocusId: 'test', title: 'title'}, type: ActionTypes.SHOW_EDIT_POST_MODAL}]
        );

        const general = {
            license: {IsLicensed: 'true'},
            config: {AllowEditPost: Constants.ALLOW_EDIT_POST_NEVER},
        };
        const withLicenseState = {...initialState};
        withLicenseState.entities.general = general;

        // const testStore = mockStore(newInitialState);
        testStore = mockStore(withLicenseState);

        const {data: withLicenseData} = await testStore.dispatch(Actions.setEditingPost('latest_post_id', 0, 'test', 'title'));
        expect(withLicenseData).toEqual(false);
        expect(testStore.getActions()).toEqual([]);

        // should not allow edit for pending post
        const newLatestPost = {...latestPost, pending_post_id: latestPost.id};
        const withPendingPostState = {...initialState};
        withPendingPostState.entities.posts.posts[latestPost.id] = newLatestPost;

        testStore = mockStore(withPendingPostState);

        const {data: withPendingPostData} = await testStore.dispatch(Actions.setEditingPost('latest_post_id', 0, 'test', 'title'));
        expect(withPendingPostData).toEqual(false);
        expect(testStore.getActions()).toEqual([]);
    });

    test('hideEditPostModal', async () => {
        const testStore = await mockStore(initialState);

        await testStore.dispatch(Actions.hideEditPostModal());
        expect(testStore.getActions()).toEqual([{type: ActionTypes.HIDE_EDIT_POST_MODAL}]);
    });
});
