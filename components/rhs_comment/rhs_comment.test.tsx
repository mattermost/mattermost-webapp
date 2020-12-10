// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Posts} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import RhsComment from 'components/rhs_comment/rhs_comment.jsx';
import EmojiMap from 'utils/emoji_map';

jest.mock('utils/post_utils.jsx', () => ({
    isEdited: jest.fn().mockReturnValue(true),
    isSystemMessage: jest.fn().mockReturnValue(false),
    fromAutoResponder: jest.fn().mockReturnValue(false),
}));

import {isMobile} from 'utils/utils';
import {PostTypes} from 'utils/constants';
import {PostMetadata, Post, PostType} from 'mattermost-redux/types/posts';
jest.mock('utils/utils', () => ({
    isMobile: jest.fn(),
}));
// id: string;
// create_at: number;
// update_at: number;
// edit_at: number;
// delete_at: number;
// is_pinned: boolean;
// user_id: string;
// channel_id: string;
// root_id: string;
// parent_id: string;
// original_id: string;
// message: string;
// type: PostType;
// props: Record<string, any>;
// hashtags: string;
// pending_post_id: string;
// reply_count: number;
// file_ids?: any[];
// metadata: PostMetadata;
// failed?: boolean;
// user_activity_posts?: Array<Post>;
// state?: 'DELETED';
describe('components/RhsComment', () => {
    const post: Post = {
        channel_id: 'channel_id',
        create_at: 1502715365009,
        delete_at: 0,
        edit_at: 1502715372443,
        id: 'id',
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
    const baseProps = {
        post,
        teamId: 'team_id',
        currentUserId: 'user_id',
        compactDisplay: true,
        author: 'Author',
        reactions: {},
        isFlagged: true,
        isBusy: false,
        removePost: jest.fn(),
        previewCollapsed: '',
        previewEnabled: false,
        isEmbedVisible: false,
        enableEmojiPicker: true,
        enablePostUsernameOverride: false,
        isReadOnly: false,
        pluginPostTypes: {},
        channelIsArchived: false,
        isConsecutivePost: false,
        handleCardClick: jest.fn(),
        shortcutReactToLastPostEmittedFrom: '',
        actions: {
            markPostAsUnread: jest.fn(),
            emitShortcutReactToLastPostFrom: jest.fn(),
        },
        emojiMap: new EmojiMap(new Map()),
        a11yIndex: 1,
        isLastPost: false
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <RhsComment {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot hovered', () => {
        const wrapper = shallowWithIntl(
            <RhsComment {...baseProps}/>,
        );

        wrapper.setState({hover: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot mobile', () => {
        (isMobile as jest.MockedFunction<any>).mockImplementation(() => true);
        const wrapper = shallowWithIntl(
            <RhsComment {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot hovered on deleted post', () => {
        enum DELETED  {
            'DELETED' = 'DELETED'
        }
        const props = {
            ...baseProps,
            post: {
                ...baseProps.post,
                state: DELETED.DELETED,
            },
        };
        const wrapper = shallowWithIntl(
            <RhsComment {...props}/>,
        );
        wrapper.setState({hover: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('should show pointer when alt is held down', () => {
        const wrapper = shallowWithIntl(
            <RhsComment {...baseProps}/>,
        );

        expect(wrapper.find('.post.cursor--pointer').exists()).toBe(false);

        wrapper.setState({alt: true});

        expect(wrapper.find('.post.cursor--pointer').exists()).toBe(true);
    });

    test('should not show pointer when alt is held down, but channel is archived', () => {
        const props = {
            ...baseProps,
            channelIsArchived: true,
        };

        const wrapper = shallowWithIntl(
            <RhsComment {...props}/>,
        );

        expect(wrapper.find('.post.cursor--pointer').exists()).toBe(false);

        wrapper.setState({alt: true});

        expect(wrapper.find('.post.cursor--pointer').exists()).toBe(false);
    });

    test('should call markPostAsUnread when post is alt+clicked on', () => {
        const wrapper = shallowWithIntl(
            <RhsComment {...baseProps}/>,
        );

        wrapper.simulate('click', {altKey: false});

        expect(baseProps.actions.markPostAsUnread).not.toHaveBeenCalled();

        wrapper.simulate('click', {altKey: true});

        expect(baseProps.actions.markPostAsUnread).toHaveBeenCalledWith(baseProps.post);
    });

    test('should not call markPostAsUnread when post is alt+clicked on when channel is archived', () => {
        const props = {
            ...baseProps,
            channelIsArchived: true,
        };

        const wrapper = shallowWithIntl(
            <RhsComment {...props}/>,
        );

        wrapper.simulate('click', {altKey: false});

        expect(props.actions.markPostAsUnread).not.toHaveBeenCalled();

        wrapper.simulate('click', {altKey: true});

        expect(props.actions.markPostAsUnread).not.toHaveBeenCalled();
    });
});
