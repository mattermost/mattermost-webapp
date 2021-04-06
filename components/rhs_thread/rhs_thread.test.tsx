// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';
import {Post} from 'mattermost-redux/types/posts';

import {TestHelper} from 'utils/test_helper';

import RhsThread from './rhs_thread';

describe('components/RhsThread', () => {
    const post: Post = TestHelper.getPostMock({
        channel_id: 'channel_id',
        create_at: 1502715365009,
        update_at: 1502715372443,
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
    };

    const directTeammate: UserProfile = TestHelper.getUserMock();

    const baseProps = {
        posts: [post],
        selected: post,
        channel,
        currentUserId: 'user_id',
        previewCollapsed: 'false',
        previewEnabled: true,
        socketConnectionStatus: true,
        actions,
        directTeammate,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <RhsThread {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should make api call to get thread posts on socket reconnect', () => {
        const wrapper = shallow(
            <RhsThread {...baseProps}/>,
        );

        wrapper.setProps({socketConnectionStatus: false});
        wrapper.setProps({socketConnectionStatus: true});

        expect(actions.getPostThread).toHaveBeenCalledWith(post.id);
    });

    test('should update openTime state when selected prop updated', async () => {
        jest.useRealTimers();
        const wrapper = shallow(
            <RhsThread {...baseProps}/>,
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
            <RhsThread {...baseProps}/>,
        );
        const instance = wrapper.instance() as RhsThread;
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
            <RhsThread {...baseProps}/>,
        );
        const instance = wrapper.instance() as RhsThread;
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
});
