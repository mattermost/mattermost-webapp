// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PostList from 'components/post_view/post_list';

function emptyFunction() {} //eslint-disable-line no-empty-function

const lastViewedAt = 1532345226632;

const createFakePosts = (num) => {
    const posts = [];
    for (let i = 1; i <= num; i++) {
        posts.push({
            id: `1234${i}`,
            user_id: 'someone',
            create_at: 1532345226631, // 1 less than lastViewedAt
        });
    }

    return posts;
};

describe('components/post_view/post_list', () => {
    it('should match init snapshot', () => {
        const posts = [{
            id: '12345',
            user_id: 'someone',
            create_at: 1532345226652,
        },
        ...createFakePosts(3),
        ];

        const actionsProp = {
            loadOlderPosts: emptyFunction,
            loadNewerPosts: emptyFunction,
        };

        const wrapper = shallow(
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
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should call newerPosts and olderPosts with right postId', () => {
        const loadNewerPosts = jest.fn();
        const loadOlderPosts = jest.fn();

        const posts = [{
            id: '12345-1234',
            user_id: 'someone',
            create_at: 1532345226652,
            type: 'system_combined_user_activity',
            system_post_ids: ['123', '124'],
        },
        ...createFakePosts(3),
        {
            id: '12345-1235',
            user_id: 'someone',
            create_at: 1532345226652,
            type: 'system_combined_user_activity',
            system_post_ids: ['121', '122'],
        }];
        const wrapper = shallow(
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
            />
        );
        wrapper.find('button').first().simulate('click');
        expect(loadOlderPosts).toHaveBeenCalled();
        wrapper.find('button').last().simulate('click');
        expect(loadNewerPosts).toHaveBeenCalled();
    });
});
