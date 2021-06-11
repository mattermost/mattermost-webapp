// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';
import {Post} from 'mattermost-redux/types/posts';
import {UserThread} from 'mattermost-redux/types/threads';

import {TestHelper} from 'utils/test_helper';

import ThreadViewer from './thread_viewer';

describe('components/threading/ThreadViewer', () => {
    const post: Post = TestHelper.getPostMock({
        channel_id: 'channel_id',
        create_at: 1502715365009,
        update_at: 1502715372443,
        is_following: true,
        reply_count: 3,
    });

    const channel: Channel = TestHelper.getChannelMock({
        display_name: '',
        name: '',
        header: '',
        purpose: '',
        creator_id: '',
        scheme_id: '',
        isCurrent: false,
        teammate_id: '',
        status: '',
        fake: false,
    });

    const actions = {
        removePost: jest.fn(),
        selectPostCard: jest.fn(),
        getPostThread: jest.fn(),
        getThread: jest.fn(),
        updateThreadRead: jest.fn(),
        updateThreadLastOpened: jest.fn(),
    };

    const directTeammate: UserProfile = TestHelper.getUserMock();

    const baseProps = {
        posts: [post],
        selected: post,
        channel,
        currentUserId: 'user_id',
        currentTeamId: 'team_id',
        previewCollapsed: 'false',
        previewEnabled: true,
        socketConnectionStatus: true,
        actions,
        directTeammate,
        isCollapsedThreadsEnabled: false,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ThreadViewer {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should make api call to get thread posts on socket reconnect', () => {
        const wrapper = shallow(
            <ThreadViewer {...baseProps}/>,
        );

        wrapper.setProps({socketConnectionStatus: false});
        wrapper.setProps({socketConnectionStatus: true});

        expect(actions.getPostThread).toHaveBeenCalledWith(post.id);
    });

    test('should update openTime state when selected prop updated', async () => {
        jest.useRealTimers();
        const wrapper = shallow(
            <ThreadViewer {...baseProps}/>,
        );

        const waitMilliseconds = 100;
        const originalOpenTimeState = wrapper.state('openTime');

        await new Promise((resolve) => setTimeout(resolve, waitMilliseconds));

        wrapper.setProps({selected: {...post, id: `${post.id}_new`}});
        expect(wrapper.state('openTime')).not.toEqual(originalOpenTimeState);
    });

    test('should scroll to the bottom when the current user makes a new post in the thread', () => {
        const scrollToBottom = jest.fn();

        const wrapper = shallow(
            <ThreadViewer {...baseProps}/>,
        );
        const instance = wrapper.instance() as ThreadViewer;
        instance.scrollToBottom = scrollToBottom;

        expect(scrollToBottom).not.toHaveBeenCalled();
        wrapper.setProps({
            posts: [
                {
                    id: 'newpost',
                    root_id: post.id,
                    user_id: 'user_id',
                },
                post,
            ],
        });

        expect(scrollToBottom).toHaveBeenCalled();
    });

    test('should not scroll to the bottom when another user makes a new post in the thread', () => {
        const scrollToBottom = jest.fn();

        const wrapper = shallow(
            <ThreadViewer {...baseProps}/>,
        );
        const instance = wrapper.instance() as ThreadViewer;
        instance.scrollToBottom = scrollToBottom;

        expect(scrollToBottom).not.toHaveBeenCalled();

        wrapper.setProps({
            posts: [
                {
                    id: 'newpost',
                    root_id: post.id,
                    user_id: 'other_user_id',
                },
                post,
            ],
        });

        expect(scrollToBottom).not.toHaveBeenCalled();
    });

    test('should not scroll to the bottom when there is a highlighted reply', () => {
        const scrollToBottom = jest.fn();

        const wrapper = shallow(
            <ThreadViewer
                {...baseProps}
                highlightedPostId='42'
            />,
        );

        const instance = wrapper.instance() as ThreadViewer;
        instance.scrollToBottom = scrollToBottom;

        wrapper.setProps({
            posts: [
                {
                    id: 'newpost',
                    root_id: post.id,
                    user_id: 'user_id',
                },
                post,
            ],
        });

        expect(scrollToBottom).not.toHaveBeenCalled();
    });

    test('should not break if root post is missing', () => {
        const props = {
            ...baseProps,
            posts: [{...baseProps.posts[0], root_id: 'something'}],
        };

        expect(() => {
            shallow(<ThreadViewer {...props}/>);
        }).not.toThrowError("Cannot read property 'reply_count' of undefined");
    });

    test('should call fetchThread when no thread on mount', () => {
        const {actions} = baseProps;

        shallow(
            <ThreadViewer
                {...baseProps}
                isCollapsedThreadsEnabled={true}
            />,
        );

        expect.assertions(3);
        expect(actions.updateThreadLastOpened).not.toHaveBeenCalled();
        expect(actions.updateThreadRead).not.toHaveBeenCalled();
        expect(actions.getThread).toHaveBeenCalledWith('user_id', 'team_id', 'id', true);
    });

    test('should call updateThreadLastOpened on mount', () => {
        jest.useFakeTimers('modern').setSystemTime(400);
        const {actions} = baseProps;
        const userThread = {
            id: 'id',
            last_viewed_at: 42,
            last_reply_at: 32,
        } as UserThread;

        shallow(
            <ThreadViewer
                {...baseProps}
                userThread={userThread}
                isCollapsedThreadsEnabled={true}
            />,
        );

        expect.assertions(3);
        expect(actions.updateThreadLastOpened).toHaveBeenCalledWith('id', 42);
        expect(actions.updateThreadRead).not.toHaveBeenCalled();
        expect(actions.getThread).not.toHaveBeenCalled();
    });

    test('should call updateThreadLastOpened and updateThreadRead on mount when unread replies', () => {
        jest.useFakeTimers('modern').setSystemTime(400);
        const {actions} = baseProps;
        const userThread = {
            id: 'id',
            last_viewed_at: 42,
            last_reply_at: 142,
        } as UserThread;

        shallow(
            <ThreadViewer
                {...baseProps}
                userThread={userThread}
                isCollapsedThreadsEnabled={true}
            />,
        );

        expect.assertions(3);
        expect(actions.updateThreadLastOpened).toHaveBeenCalledWith('id', 42);
        expect(actions.updateThreadRead).toHaveBeenCalledWith('user_id', 'team_id', 'id', 400);
        expect(actions.getThread).not.toHaveBeenCalled();
    });

    test('should call updateThreadLastOpened and updateThreadRead upon thread id change', () => {
        jest.useFakeTimers('modern').setSystemTime(400);
        const {actions} = baseProps;

        const userThread = {
            id: 'id',
            last_viewed_at: 42,
            last_reply_at: 142,
        } as UserThread;

        const wrapper = shallow(
            <ThreadViewer
                {...baseProps}
                isCollapsedThreadsEnabled={true}
            />,
        );

        expect.assertions(6);
        expect(actions.updateThreadLastOpened).not.toHaveBeenCalled();
        expect(actions.updateThreadRead).not.toHaveBeenCalled();
        expect(actions.getThread).toHaveBeenCalled();

        jest.resetAllMocks();
        wrapper.setProps({userThread});

        expect(actions.updateThreadLastOpened).toHaveBeenCalledWith('id', 42);
        expect(actions.updateThreadRead).toHaveBeenCalledWith('user_id', 'team_id', 'id', 400);
        expect(actions.getThread).not.toHaveBeenCalled();
    });
});
