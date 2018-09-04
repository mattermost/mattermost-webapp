// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PostView from 'components/post_view/post_view';

function emptyFunction() {} //eslint-disable-line no-empty-function

const actionsProp = {
    getPostThread: emptyFunction,
    loadUnreads: emptyFunction,
    loadPosts: emptyFunction,
    changeChannelPostsStatus: emptyFunction,
    syncChannelPosts: emptyFunction,
    channelSyncCompleted: emptyFunction,
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
    it('init snapshot', () => {
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
        expect(wrapper).toMatchSnapshot();
    });

    it('init snapshot for max postVisibility', async () => {
        const emptyPostList = [];

        const channelPostsStatusObj = {
            atEnd: false,
            atStart: false,
        };

        const loadUnreads = async () => {
            return {
                data: {posts: {}, order: []},
            };
        };

        const wrapper = shallow(
            <PostView
                actions={{
                    ...actionsProp,
                    loadUnreads,
                }}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                posts={emptyPostList}
                channelPostsStatus={channelPostsStatusObj}
                channelSyncStatus={true}
                postVisibility={1000001}
            />
        );

        await loadUnreads();
        await wrapper.instance().postsOnLoad();
        wrapper.setState({olderPosts: {loading: false, allLoaded: false}, newerPosts: {loading: false, allLoaded: false}});
        wrapper.update();
        expect(wrapper).toMatchSnapshot();
    });

    it('Should call postsOnLoad', async () => {
        const emptyPostList = [];

        const loadUnreads = async () => {
            return {
                data: {posts: {}, order: []},
            };
        };

        const changeChannelPostsStatus = jest.fn();

        const wrapper = shallow(
            <PostView
                actions={{
                    ...actionsProp,
                    loadUnreads,
                    changeChannelPostsStatus,
                }}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                posts={emptyPostList}
                channelPostsStatus={channelPostsStatus}
            />
        );

        await loadUnreads();
        await wrapper.instance().postsOnLoad();
        wrapper.update();
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atEnd: true});
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atStart: true});
        expect(wrapper).toMatchSnapshot();
    });

    it('Should call for before and afterPosts', async () => {
        const loadPosts = async () => {
            return true;
        };

        const changeChannelPostsStatus = jest.fn();

        const wrapper = shallow(
            <PostView
                actions={{
                    ...actionsProp,
                    loadPosts,
                    changeChannelPostsStatus,
                }}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                posts={createFakePosts(2)}
            />
        );

        wrapper.instance().getPostsBefore('1234');
        expect(wrapper.state().olderPosts.loading).toEqual(true);
        await loadPosts();
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atStart: false});
        expect(wrapper.state().olderPosts.loading).toEqual(false);

        wrapper.instance().getPostsAfter('1234');
        expect(wrapper.state().newerPosts.loading).toEqual(true);
        await loadPosts();
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atEnd: false});
        expect(wrapper.state().newerPosts.loading).toEqual(false);
    });

    it('Should handle more than 30 posts onLoad with 0 unread', async () => {
        const emptyPostList = [];
        const fakePosts = [
            ...createFakePosts(35),
            {
                id: '123456',
                user_id: 'someone',
                create_at: 1532345226634,
            },
        ];

        const loadUnreads = async () => {
            return {
                data: {posts: fakePosts, order: []},
            };
        };

        const changeChannelPostsStatus = jest.fn();

        const wrapper = shallow(
            <PostView
                actions={{
                    ...actionsProp,
                    loadUnreads,
                    changeChannelPostsStatus,
                }}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                posts={emptyPostList}
                channelPostsStatus={channelPostsStatus}
            />
        );

        await loadUnreads();
        await wrapper.instance().postsOnLoad();
        wrapper.update();
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atEnd: true});
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atStart: false});
        expect(wrapper).toMatchSnapshot();
    });

    it('should call sync posts if syncStatus is false or on socket recoonect', async () => {
        const channelPostsStatusObj = {
            atEnd: true,
            atStart: false,
        };

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
                posts={createFakePosts(3)}
                channelPostsStatus={channelPostsStatusObj}
                channelSyncStatus={channelSyncStatus}
                socketStatus={socketStatus}
            />
        );
        expect(syncChannelPosts).toHaveBeenCalledTimes(1);
    });

    it('Should call permalink posts', async () => {
        const emptyPostList = [];
        const focusedPostId = 'new';

        const channelPostsStatusObj = {atEnd: false, atStart: false};
        const changeChannelPostsStatus = jest.fn();
        const getPostThread = async () => {
            return {
                data: {posts: createFakePosts(1), order: []},
            };
        };
        const loadPosts = async () => {
            return false;
        };
        const wrapper = shallow(
            <PostView
                actions={{
                    ...actionsProp,
                    getPostThread,
                    loadPosts,
                    changeChannelPostsStatus,
                }}
                lastViewedAt={lastViewedAt}
                channelId={channelId}
                focusedPostId={focusedPostId}
                posts={emptyPostList}
                channelPostsStatus={channelPostsStatusObj}
                channelSyncStatus={true}
            />
        );
        await getPostThread();
        await loadPosts();
        await loadPosts();
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atEnd: true});
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId, atStart: true});
        await wrapper.instance().loadPermalinkPosts();
        wrapper.update();
    });
});
