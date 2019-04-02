// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import PostList from 'components/post_view/post_list.jsx';
import {PostListRowListIds} from 'utils/constants.jsx';

const returnDummyPostsAndIds = () => {
    const postsArray = [];
    const Ids = [];
    const createAtValue = 12346;
    for (var i = 1; i <= 30; i++) {
        const postCreatedAt = createAtValue + i;
        postsArray.push({
            id: `${postCreatedAt}`,
            message: 'test',
            create_at: postCreatedAt,
        });
        Ids.push(`${postCreatedAt}`);
    }

    return {
        postsArray,
        Ids,
    };
};

describe('components/post_view/post_list', () => {
    const posts = [{
        id: 'postId',
        message: 'test',
        create_at: 12345,
    }];

    const actions = {
        getPosts: jest.fn().mockResolvedValue({data: {order: [], posts: {}}}),
        getPostsBefore: jest.fn().mockResolvedValue({data: {order: [], posts: {}}}),
        getPostsAfter: jest.fn().mockResolvedValue({data: {order: [], posts: {}}}),
        getPostThread: jest.fn().mockResolvedValue({data: {order: [], posts: {}}}),
        increasePostVisibility: jest.fn().mockResolvedValue({moreToLoad: true}),
        checkAndSetMobileView: jest.fn(),
    };

    const baseProps = {
        posts,
        postListIds: ['postId'],
        postsObjById: {
            postId: posts[0],
        },
        postVisibility: 30,
        channel: {
            id: 'channelId',
        },
        lastViewedAt: 12344,
        currentUserId: 'currentUserId',
        channelLoading: false,
        actions,
    };

    test('should return index of loader when all are unread messages in the view and call increasePostVisibility action', () => {
        const {Ids, postsArray} = returnDummyPostsAndIds();
        const postListIds = [...Ids, PostListRowListIds.START_OF_NEW_MESSAGES];
        const props = {
            ...baseProps,
            posts: postsArray,
            lastViewedAt: 12345,
            postListIds,
        };
        const wrapper = shallow(<PostList {...props}/>);
        const initScrollToIndex = wrapper.instance().initScrollToIndex();
        expect(initScrollToIndex).toEqual({index: 31, position: 'start'}); //Loader will be at pos 31
        expect(actions.increasePostVisibility).toHaveBeenCalledTimes(1);
    });

    test('should set the state of atEnd to true when increasePostVisibility returns moreToLoad false', async () => {
        const increasePostVisibilityMock = jest.fn().mockResolvedValue({moreToLoad: false});
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                increasePostVisibility: increasePostVisibilityMock,
            },
        };
        const wrapper = mountWithIntl(<PostList {...props}/>);
        await wrapper.instance().loadMorePosts();
        expect(increasePostVisibilityMock).toHaveBeenCalledTimes(1);
        wrapper.update();
        expect(wrapper.state('atEnd')).toEqual(true);
    });
});
