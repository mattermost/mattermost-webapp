// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import PostListWrapper from 'components/post_view/post_list';

function emptyFunction() {} //eslint-disable-line no-empty-function

const actionsProp = {
    getPostThread: emptyFunction,
    loadUnreads: emptyFunction,
    loadPosts: emptyFunction,
    clearPostsFromChannel: emptyFunction,
    channelPostsStatus: emptyFunction,
    backUpPostsInChannel: emptyFunction,
    channelSyncCompleted: emptyFunction,
    addPostIdsFromBackUp: emptyFunction,
};

let channelPostsStatus;
const lastViewedAt = 1532345226632;
const channel = {
    id: 'fake-id',
    name: 'fake-channel',
    display_name: 'Fake Channel',
};

const match = {
    params: {},
};

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
            <PostListWrapper
                actions={actionsProp}
                lastViewedAt={lastViewedAt}
                channel={channel}
                match={match}
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
            <PostListWrapper
                actions={{
                    ...actionsProp,
                    loadUnreads,
                }}
                lastViewedAt={lastViewedAt}
                channel={channel}
                match={match}
                posts={emptyPostList}
                channelPostsStatus={channelPostsStatusObj}
                postVisibility={1000001}
            />
        );

        await loadUnreads();
        await wrapper.instance().postsOnLoad();
        wrapper.setState({olderPosts: {loading: false, allLoaded: false}, newerPosts: {loading: false, allLoaded: false}});
        wrapper.update();
        expect(wrapper.state().isDoingInitialLoad).toEqual(false);
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
            <PostListWrapper
                actions={{
                    ...actionsProp,
                    loadUnreads,
                    channelPostsStatus: changeChannelPostsStatus,
                }}
                lastViewedAt={lastViewedAt}
                channel={channel}
                match={match}
                posts={emptyPostList}
                channelPostsStatus={channelPostsStatus}
            />
        );

        await loadUnreads();
        await wrapper.instance().postsOnLoad();
        wrapper.update();
        expect(wrapper.state().isDoingInitialLoad).toEqual(false);
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId: channel.id, atEnd: true});
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId: channel.id, atStart: true});
        expect(wrapper).toMatchSnapshot();
    });

    it('Should call for before and afterPosts', async () => {
        const loadPosts = async () => {
            return true;
        };

        const changeChannelPostsStatus = jest.fn();

        const wrapper = shallow(
            <PostListWrapper
                actions={{
                    ...actionsProp,
                    loadPosts,
                    channelPostsStatus: changeChannelPostsStatus,
                }}
                lastViewedAt={lastViewedAt}
                channel={channel}
                match={match}
                posts={createFakePosts(2)}
            />
        );

        wrapper.instance().getPostsBefore('1234');
        expect(wrapper.state().olderPosts.loading).toEqual(true);
        await loadPosts();
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId: channel.id, atStart: false});
        expect(wrapper.state().olderPosts.loading).toEqual(false);

        wrapper.instance().getPostsAfter('1234');
        expect(wrapper.state().newerPosts.loading).toEqual(true);
        await loadPosts();
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId: channel.id, atEnd: false});
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
            <PostListWrapper
                actions={{
                    ...actionsProp,
                    loadUnreads,
                    channelPostsStatus: changeChannelPostsStatus,
                }}
                lastViewedAt={lastViewedAt}
                channel={channel}
                match={match}
                posts={emptyPostList}
                channelPostsStatus={channelPostsStatus}
            />
        );

        await loadUnreads();
        await wrapper.instance().postsOnLoad();
        wrapper.update();
        expect(wrapper.state().isDoingInitialLoad).toEqual(false);
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId: channel.id, atEnd: true});
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId: channel.id, atStart: false});
        expect(wrapper).toMatchSnapshot();
    });

    it('Should call permalink posts', async () => {
        const emptyPostList = [];
        const msgParams = {
            params: {
                messageId: 'new',
            },
        };
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
            <PostListWrapper
                actions={{
                    ...actionsProp,
                    getPostThread,
                    loadPosts,
                    channelPostsStatus: changeChannelPostsStatus,
                }}
                lastViewedAt={lastViewedAt}
                channel={channel}
                match={msgParams}
                posts={emptyPostList}
                channelPostsStatus={channelPostsStatusObj}
            />
        );

        await getPostThread();
        await loadPosts();
        await loadPosts();
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId: channel.id, atEnd: true});
        expect(changeChannelPostsStatus).toHaveBeenCalledWith({channelId: channel.id, atStart: true});
        await wrapper.instance().loadPermalinkPosts();
        wrapper.update();
        expect(wrapper.state().isDoingInitialLoad).toEqual(false);
    });

    it('should call sync posts if syncStatus is false or on socket recoonect', async () => {
        const channelPostsStatusObj = {
            atEnd: true,
            atStart: false,
        };
        const postsArray = createFakePosts(3);
        const posts = postsArray.reduce((postsObj, post) => ({
            [post.id]: post,
        }), {});
        const order = postsArray.reduce((ids, post) => ([
            ...ids,
            post.id,
        ]), []);
        const channelSyncStatus = false;
        const syncChannelPosts = async () => {
            return {
                data: {posts, order},
            };
        };
        const socketStatus = {
            lastDisconnectAt: 1234,
        };
        const channelSyncCompleted = jest.fn();

        const wrapper = shallow(
            <PostListWrapper
                actions={{
                    ...actionsProp,
                    syncChannelPosts,
                    channelSyncCompleted,
                }}
                lastViewedAt={lastViewedAt}
                channel={channel}
                match={match}
                posts={createFakePosts(3)}
                channelPostsStatus={channelPostsStatusObj}
                channelSyncStatus={channelSyncStatus}
                socketStatus={socketStatus}
            />
        );
        await syncChannelPosts();
        expect(channelSyncCompleted).toHaveBeenCalledTimes(1);

        wrapper.setProps({socketStatus: {lastDisconnectAt: 1238, connected: false}});
        wrapper.setProps({socketStatus: {lastDisconnectAt: 1238, connected: true}, channelPostsStatus: {atEnd: false}});
        await syncChannelPosts();
        expect(channelSyncCompleted).toHaveBeenCalledTimes(2);
    });
});
