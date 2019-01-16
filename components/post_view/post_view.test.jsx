// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {PostRequestTypes} from 'utils/constants.jsx';

import PostView from './post_view';

function emptyFunction() {} //eslint-disable-line no-empty-function

const mockApiAscSuccess = async () => {
    return {
        data: {posts: {}, order: []},
    };
};

const loadPostsMock = async () => {
    return {
        moreToLoad: true,
    };
};

const actionsProp = {
    getPostThread: emptyFunction,
    loadUnreads: mockApiAscSuccess,
    loadPosts: loadPostsMock,
    changeChannelPostsStatus: jest.fn(),
    syncChannelPosts: jest.fn(),
    channelSyncCompleted: emptyFunction,
    checkAndSetMobileView: emptyFunction,
};

let channelPostsStatus;
const lastViewedAt = 1532345226632;
const channelId = 'fake-id';

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
    it('snapshot for loading when there are no posts', () => {
        const emptyPostList = undefined;
        const wrapper = shallow(
            <PostView
                actions={actionsProp}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                posts={emptyPostList}
                channelPostsStatus={channelPostsStatus}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('snapshot with couple of posts', () => {
        const postList = createFakePosts(2);
        const wrapper = shallow(
            <PostView
                actions={actionsProp}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                posts={postList}
                channelPostsStatus={channelPostsStatus}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('init snapshot for max postVisibility', async () => {
        const emptyPostList = [];

        const channelPostsStatusObj = {
            atEnd: false,
            atStart: false,
        };

        const wrapper = shallow(
            <PostView
                actions={actionsProp}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                posts={emptyPostList}
                channelPostsStatus={channelPostsStatusObj}
                channelSyncStatus={true}
                postVisibility={1000001}
            />
        );

        await actionsProp.loadUnreads();
        await wrapper.instance().postsOnLoad();
        wrapper.setState({olderPosts: {loading: false, allLoaded: false}, newerPosts: {loading: false, allLoaded: false}});
        wrapper.update();
        expect(wrapper).toMatchSnapshot();
    });

    it('Should call postsOnLoad', async () => {
        const emptyPostList = [];

        const wrapper = shallow(
            <PostView
                actions={actionsProp}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                posts={emptyPostList}
                channelPostsStatus={channelPostsStatus}
            />
        );

        await actionsProp.loadUnreads();
        await wrapper.instance().postsOnLoad();
        wrapper.update();
        expect(actionsProp.changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atEnd: true});
        expect(actionsProp.changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atStart: true});
        expect(wrapper).toMatchSnapshot();
    });

    it('Should call for before and afterPosts', async () => {
        const wrapper = shallow(
            <PostView
                actions={actionsProp}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                posts={createFakePosts(2)}
            />
        );

        wrapper.instance().getPostsBefore('1234');
        expect(wrapper.state().olderPosts.loading).toEqual(true);
        await actionsProp.loadPosts();
        expect(actionsProp.changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atStart: false});
        expect(wrapper.state().olderPosts.loading).toEqual(false);

        wrapper.instance().getPostsAfter('1234');
        expect(wrapper.state().newerPosts.loading).toEqual(true);
        await actionsProp.loadPosts();
        expect(actionsProp.changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atEnd: false});
        expect(wrapper.state().newerPosts.loading).toEqual(false);
    });

    it('Should handle changeChannelPostsStatus call for more than 30 posts onLoad with 0 unread', async () => {
        const fakePosts = [
            ...createFakePosts(35),
            {
                id: '123456',
                user_id: 'someone',
                create_at: 1532345226634,
            },
        ];

        const wrapper = shallow(
            <PostView
                actions={actionsProp}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                posts={fakePosts}
                channelPostsStatus={channelPostsStatus}
            />
        );

        await actionsProp.loadUnreads();
        await wrapper.instance().postsOnLoad();
        wrapper.update();
        expect(actionsProp.changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atEnd: true});
        expect(actionsProp.changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atStart: true});
    });

    it('should call sync posts if syncStatus is false and posts exist ', async () => {
        const channelPostsStatusObj = {
            atEnd: true,
            atStart: false,
        };

        const postsObj = createFakePosts(3);
        const channelSyncStatus = false;
        const syncChannelPosts = jest.fn();
        const socketStatus = {
            lastDisconnectAt: 1234,
        };
        const channelSyncCompleted = jest.fn();

        shallow(
            <PostView
                actions={{
                    ...actionsProp,
                    syncChannelPosts,
                    channelSyncCompleted,
                }}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                posts={postsObj}
                channelPostsStatus={channelPostsStatusObj}
                channelSyncStatus={channelSyncStatus}
                socketStatus={socketStatus}
            />
        );
        expect(syncChannelPosts).toHaveBeenCalledTimes(1);
        expect(syncChannelPosts).toHaveBeenCalledWith({
            channelId,
            channelPostsStatus: channelPostsStatusObj,
            posts: postsObj,
            lastDisconnectAt: socketStatus.lastDisconnectAt,
        });
    });

    it('Should call APIs for permalink posts', () => {
        const emptyPostList = [];
        const focusedPostId = 'new';

        const channelPostsStatusObj = {atEnd: false, atStart: false};
        const getPostThread = jest.fn();
        const loadPosts = jest.fn();

        shallow(
            <PostView
                actions={{
                    ...actionsProp,
                    getPostThread,
                    loadPosts,
                }}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                focusedPostId={focusedPostId}
                posts={emptyPostList}
                channelPostsStatus={channelPostsStatusObj}
                channelSyncStatus={true}
            />
        );
        expect(getPostThread).toHaveBeenCalledWith('new', false);
        expect(loadPosts).toHaveBeenCalledWith({channelId, postId: 'new', type: PostRequestTypes.AFTER_ID});
        expect(loadPosts).toHaveBeenCalledWith({channelId, postId: 'new', type: PostRequestTypes.BEFORE_ID});
    });

    it('Should sync posts on socket status change', () => {
        const postsObj = createFakePosts(3);
        const socketStatus = {
            lastDisconnectAt: 1234,
            connected: false,
        };
        const channelPostsStatusObj = {atEnd: true, atStart: false};

        const wrapper = shallow(
            <PostView
                actions={actionsProp}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                posts={postsObj}
                channelPostsStatus={channelPostsStatusObj}
                channelSyncStatus={true}
                socketStatus={socketStatus}
            />
        );

        wrapper.setProps({
            socketStatus: {
                lastDisconnectAt: 1234,
                connected: true,
            },
        });
        expect(actionsProp.syncChannelPosts).toHaveBeenCalledWith({
            channelId,
            channelPostsStatus: channelPostsStatusObj,
            posts: postsObj,
            lastDisconnectAt: socketStatus.lastDisconnectAt,
        });
    });
});
