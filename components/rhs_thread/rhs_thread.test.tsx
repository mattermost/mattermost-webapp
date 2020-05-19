// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';
import {Post} from 'mattermost-redux/src/types/posts';

import RhsThread from './rhs_thread';

describe('components/RhsThread', () => {
    const post: Post = {
        edit_at: 0,
        original_id: '',
        hashtags: '',
        pending_post_id: '',
        reply_count: 0,
        metadata: {
            embeds: [],
            emojis: [],
            files: [],
            images: {},
            reactions: []
        },
        channel_id: 'channel_id',
        create_at: 1502715365009,
        delete_at: 0,
        id: 'id',
        is_pinned: false,
        message: 'post message',
        parent_id: '',
        props: {},
        root_id: '',
        type: 'system_add_remove',
        update_at: 1502715372443,
        user_id: 'user_id',
    };

    const channel: Channel = {
        id: 'channel_id',
        create_at: 0,
        update_at: 0,
        team_id: 'team_id',
        delete_at: 0,
        type: 'O',
        display_name: '',
        name: '',
        header: '',
        purpose: '',
        last_post_at: 0,
        total_msg_count: 0,
        extra_update_at: 0,
        creator_id: '',
        scheme_id: '',
        isCurrent: false,
        teammate_id: '',
        status: '',
        fake: false,
        group_constrained: false
    };

    const actions = {
        removePost: jest.fn(),
        selectPostCard: jest.fn(),
        getPostThread: jest.fn(),
    };

    const directTeammate: UserProfile = {
        id: '',
        create_at: 0,
        update_at: 0,
        delete_at: 0,
        username: '',
        auth_data: '',
        auth_service: '',
        email: '',
        email_verified: true,
        nickname: '',
        first_name: '',
        last_name: '',
        position: '',
        roles: '',
        locale: '',
        notify_props: {
            desktop: 'default',
            desktop_sound: 'true',
            email: 'true',
            mark_unread: 'all',
            push: 'default',
            push_status: 'ooo',
            comments: 'never',
            first_name: 'true',
            channel: 'true',
            mention_keys: '',
        },
        terms_of_service_id: '',
        terms_of_service_create_at: 0,
        timezone: {
            useAutomaticTimezone: true,
            automaticTimezone: '',
            manualTimezone: '',
        },
        is_bot: true,
        last_picture_update: 0,
    };

    const baseProps = {
        posts: [post],
        selected: post,
        channel,
        currentUserId: 'user_id',
        previewCollapsed: 'false',
        previewEnabled: true,
        socketConnectionStatus: true,
        actions,
        directTeammate
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <RhsThread {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should make api call to get thread posts on socket reconnect', () => {
        const wrapper = shallow(
            <RhsThread {...baseProps}/>
        );

        wrapper.setProps({socketConnectionStatus: false});
        wrapper.setProps({socketConnectionStatus: true});

        expect(actions.getPostThread).toHaveBeenCalledWith(post.id);
    });

    test('should update openTime state when selected prop updated', async () => {
        jest.useRealTimers();
        const wrapper = shallow(
            <RhsThread {...baseProps}/>
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
            <RhsThread {...baseProps}/>
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
            <RhsThread {...baseProps}/>
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
