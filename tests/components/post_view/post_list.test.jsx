// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import PostList from 'components/post_view/post_list';

function emptyFunction() {} //eslint-disable-line no-empty-function

const lastViewedAt = 1532345226632;
const mockStore = configureStore([thunk]);
const fakePostsHelper = (num) => {
    const posts = [];
    const postsInChannel = [];

    for (let i = 1; i <= num; i++) {
        posts.push({
            id: `1234${i}`,
            user_id: 'someone',
            create_at: 1532345226631, // 1 less than lastViewedAt
        });
        postsInChannel.push(`1234${i}`);
    }

    return {
        posts,
        postsInChannel,
    };
};

describe('components/post_view/post_list', () => {
    const fakeInitPosts = fakePostsHelper(3);
    const initialState = {
        entities: {
            posts: {
                posts: fakeInitPosts.posts,
                postsInChannel: fakeInitPosts.postsInChannel,
                postsInThread: {},
            },
            users: {
                currentUserId: 'myself',
                profiles: {
                    myself: {id: 'myself'},
                },
                statuses: {
                    myself: 'online',
                },
            },
            preferences: {
                myPreferences: {},
            },
        },
    };

    it('should match init snapshot', () => {
        const fakePosts = fakePostsHelper(3);
        const posts = [{
            id: '12345',
            user_id: 'someone',
            create_at: 1532345226652,
        },
        ...fakePosts.posts,
        ];

        const postsInChannel = ['12345', ...fakePosts.postsInChannel];

        const modifiedPostsEntity = {
            posts: {
                ...initialState.entities.posts,
                posts: {
                    ...initialState.entities.posts.posts,
                    ...posts,
                },
                postsInChannel: {
                    ...initialState.entities.posts.postsInChannel,
                    ...postsInChannel,
                },
            },

        };

        const modifiedState = {
            ...initialState,
            entities: {
                ...initialState.entities,
                posts: modifiedPostsEntity,
            },
        };

        const store = mockStore(modifiedState);

        const actionsProp = {
            loadOlderPosts: emptyFunction,
            loadNewerPosts: emptyFunction,
            checkAndSetMobileView: emptyFunction,
        };

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <PostList
                    posts={posts}
                    disableLoadingPosts={false}
                    currentUserId={'myself'}
                    newerPosts={{
                        loading: false,
                        allLoaded: false,
                    }}
                    olderPosts={{
                        loading: false,
                        allLoaded: false,
                    }}
                    lastViewedAt={lastViewedAt}
                    {...actionsProp}
                />
            </Provider>
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should call newerPosts and olderPosts with right postId', () => {
        const loadNewerPosts = jest.fn();
        const loadOlderPosts = jest.fn();
        const checkAndSetMobileView = jest.fn();

        const fakePosts = fakePostsHelper(3);
        const posts = [{
            id: '12345-1234',
            user_id: 'someone',
            create_at: 1532345226652,
            type: 'system_combined_user_activity',
            system_post_ids: ['123', '124'],
        },
        ...fakePosts.posts,
        {
            id: '12345-1235',
            user_id: 'someone',
            create_at: 1532345226652,
            type: 'system_combined_user_activity',
            system_post_ids: ['121', '122'],
        }];

        const postsInChannel = ['12345-1234', ...fakePosts.postsInChannel, '12345-1235'];

        const modifiedPostsEntity = {
            posts: {
                ...initialState.entities.posts,
                posts: {
                    ...initialState.entities.posts.posts,
                    ...posts,
                },
                postsInChannel: {
                    ...initialState.entities.posts.postsInChannel,
                    ...postsInChannel,
                },
            },

        };

        const modifiedState = {
            ...initialState,
            entities: {
                ...initialState.entities,
                posts: modifiedPostsEntity,
            },
        };

        const store = mockStore(modifiedState);

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <PostList
                    posts={posts}
                    disableLoadingPosts={false}
                    currentUserId={'myself'}
                    newerPosts={{
                        loading: false,
                        allLoaded: false,
                    }}
                    olderPosts={{
                        loading: false,
                        allLoaded: false,
                    }}
                    lastViewedAt={lastViewedAt}
                    loadNewerPosts={loadNewerPosts}
                    loadOlderPosts={loadOlderPosts}
                    checkAndSetMobileView={checkAndSetMobileView}
                />
            </Provider>
        );
        wrapper.find('button').first().simulate('click');
        expect(loadOlderPosts).toHaveBeenCalled();
        wrapper.find('button').last().simulate('click');
        expect(loadNewerPosts).toHaveBeenCalled();
    });
});
