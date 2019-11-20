// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import RhsThread from './rhs_thread.jsx';

describe('components/RhsThread', () => {
    let post;
    let defaultProps;
    let actions;
    let channel;

    beforeEach(() => {
        post = {
            channel_id: 'channel_id',
            create_at: 1502715365009,
            delete_at: 0,
            id: 'id',
            is_pinned: false,
            message: 'post message',
            parent_id: '',
            props: {},
            root_id: '',
            type: '',
            update_at: 1502715372443,
            user_id: 'user_id',
        };

        channel = {
            id: 'channel_id',
            team_id: 'team_id',
            delete_at: 0,
        };

        actions = {
            removePost: jest.fn(),
            selectPostCard: jest.fn(),
            getPostThread: jest.fn(),
        };

        defaultProps = {
            posts: [post],
            selected: post,
            channel,
            currentUserId: 'user_id',
            previewCollapsed: 'false',
            previewEnabled: true,
            socketConnectionStatus: true,
            actions,
        };
    });

    test('should match snapshot', () => {
        const wrapper = shallow(
            <RhsThread {...defaultProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should make api call to get thread posts on socket reconnect', () => {
        const wrapper = shallow(
            <RhsThread {...defaultProps}/>
        );

        wrapper.setProps({socketConnectionStatus: false});
        wrapper.setProps({socketConnectionStatus: true});

        expect(actions.getPostThread).toHaveBeenCalledWith(post.id, false);
    });

    test('should update openTime state when selected prop updated', async () => {
        jest.useRealTimers();
        const wrapper = shallow(
            <RhsThread {...defaultProps}/>
        );

        const waitMilliseconds = 100;
        const originalOpenTimeState = wrapper.state('openTime');

        await new Promise((resolve) => setTimeout(resolve, waitMilliseconds));

        wrapper.setProps({selected: {...post, id: `${post.id}_new`}});
        expect(wrapper.state('openTime')).not.toEqual(originalOpenTimeState);
    });
});
