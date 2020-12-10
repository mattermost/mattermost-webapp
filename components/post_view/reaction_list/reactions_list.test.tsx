// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ReactionList from './reaction_list.jsx';
import {Post, PostType, PostMetadata} from 'mattermost-redux/types/posts';
import {PostTypes} from 'mattermost-redux/constants/posts';

describe('components/ReactionList', () => {
    const reaction = {
        user_id: '1rj9fokoeffrigu7sk5uc8aiih',
        post_id: 'xbqfo5qb4bb4ffmj9hqfji6fiw',
        emoji_name: 'expressionless',
        create_at: 1542994995740,
    };

    const reactions = {[reaction.user_id + '-' + reaction.emoji_name]: reaction};

    const post: Post = {
        id: 'post_id',
        channel_id: 'channel_id',
        create_at: 1502715365009,
        delete_at: 0,
        edit_at: 1502715372443,
        is_pinned: false,
        message: 'post message',
        original_id: '',
        parent_id: '',
        pending_post_id: '',
        props: {},
        root_id: '',
        type: PostTypes.ADD_REMOVE as PostType,
        update_at: 1502715372443,
        user_id: 'user_id',
        hashtags: '', 
        reply_count: 0, 
        metadata: {} as PostMetadata,
    };

    const teamId = 'teamId';

    const actions = {
        addReaction: jest.fn(),
    };

    const baseProps = {
        post,
        teamId,
        reactions,
        enableEmojiPicker: true,
        actions,
    };

    test('should render nothing when no reactions', () => {
        const props = {
            ...baseProps,
            reactions: {},
        };

        const wrapper = shallow(
            <ReactionList {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render when there are reactions', () => {
        const wrapper = shallow(
            <ReactionList {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
