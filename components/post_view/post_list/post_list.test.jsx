// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {PostRequestTypes} from 'utils/constants.jsx';

import PostList from './post_list.jsx';
import VirtPostList from './post_list_virtualized.jsx';

const actionsProp = {
    loadPostsAround: jest.fn().mockImplementation(() => Promise.resolve({atLatestMessage: true, atOldestmessage: true})),
    loadUnreads: jest.fn().mockImplementation(() => Promise.resolve({atLatestMessage: true, atOldestmessage: true})),
    loadPosts: jest.fn().mockImplementation(() => Promise.resolve({moreToLoad: false})),
    syncPostsInChannel: jest.fn(),
    loadLatestPosts: jest.fn().mockImplementation(() => Promise.resolve({atLatestMessage: true, atOldestmessage: true})),
    checkAndSetMobileView: jest.fn(),
};

const lastViewedAt = 1532345226632;
const channelId = 'fake-id';

const createFakePosIds = (num) => {
    const postIds = [];
    for (let i = 1; i <= num; i++) {
        postIds.push(`1234${i}`);
    }

    return postIds;
};

const baseProps = {
    actions: actionsProp,
    lastViewedAt,
    channelId,
    postListIds: [],
    changeTimeStampToShowPosts: jest.fn(),
    isFirstLoad: true,
    atLatestPost: false,
};

describe('components/post_view/post_list', () => {
    it('snapshot for loading when there are no posts', () => {
        const noPostList = undefined;
        const wrapper = shallow(
            <PostList {...{...baseProps, postListIds: noPostList}}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('snapshot with couple of posts', () => {
        const postIds = createFakePosIds(2);
        const wrapper = shallow(
            <PostList {...{...baseProps, postListIds: postIds}}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('Should call postsOnLoad', async () => {
        const emptyPostList = [];

        const wrapper = shallow(
            <PostList {...{...baseProps, postListIds: emptyPostList}}/>
        );

        expect(actionsProp.loadUnreads).toHaveBeenCalledWith(baseProps.channelId);
        await wrapper.instance().postsOnLoad();
        expect(wrapper.state('newerPosts').allLoaded).toBe(true);
        expect(wrapper.state('olderPosts').allLoaded).toBe(true);
    });

    it('Should call for before and afterPosts', async () => {
        const postIds = createFakePosIds(2);
        const wrapper = shallow(
            <PostList {...{...baseProps, postListIds: postIds}}/>
        );

        wrapper.find(VirtPostList).prop('actions').loadOlderPosts('1234');
        expect(wrapper.state('olderPosts').loading).toEqual(true);
        expect(actionsProp.loadPosts).toHaveBeenCalledWith({channelId: baseProps.channelId, postId: '1234', type: PostRequestTypes.BEFORE_ID});
        await wrapper.instance().callLoadPosts();
        expect(wrapper.state('olderPosts')).toEqual({allLoaded: true, loading: false});

        wrapper.find(VirtPostList).prop('actions').loadNewerPosts('1234');
        expect(wrapper.state('newerPosts').loading).toEqual(true);
        expect(actionsProp.loadPosts).toHaveBeenCalledWith({channelId: baseProps.channelId, postId: '1234', type: PostRequestTypes.AFTER_ID});
        await wrapper.instance().callLoadPosts();
        expect(wrapper.state('newerPosts')).toEqual({allLoaded: true, loading: false});
    });

    it('Should call for permalink posts', async () => {
        const focusedPostId = 'new';
        const wrapper = shallow(
            <PostList {...{...baseProps, focusedPostId}}/>
        );

        expect(actionsProp.loadPostsAround).toHaveBeenCalledWith(baseProps.channelId, focusedPostId);
        await wrapper.instance().loadPermalinkPosts();
        expect(wrapper.state('olderPosts')).toEqual({allLoaded: true, loading: false});
        expect(wrapper.state('newerPosts')).toEqual({allLoaded: true, loading: false});
    });

    it('Should call for loadLatestPosts', async () => {
        const noPostList = undefined;
        const wrapper = shallow(
            <PostList {...{...baseProps, postListIds: noPostList, isFirstLoad: false}}/>
        );

        expect(actionsProp.loadLatestPosts).toHaveBeenCalledWith(baseProps.channelId);
        await wrapper.instance().loadLatestPosts();
        expect(wrapper.state('olderPosts')).toEqual({allLoaded: true, loading: false});
        expect(wrapper.state('newerPosts')).toEqual({allLoaded: true, loading: false});
    });

    describe('getPostsSince', () => {
        test('should call getPostsSince on channel switch', () => {
            const postIds = createFakePosIds(2);
            shallow(<PostList {...{...baseProps, isFirstLoad: false, postListIds: postIds}}/>);
            expect(actionsProp.syncPostsInChannel).toHaveBeenCalledWith(baseProps.channelId, baseProps.latestPostTimeStamp);
        });
    });
});
