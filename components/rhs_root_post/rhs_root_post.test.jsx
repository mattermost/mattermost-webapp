// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Posts} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import RhsRootPost from 'components/rhs_root_post/rhs_root_post.jsx';
import EmojiMap from 'utils/emoji_map';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import PostPreHeader from 'components/post_view/post_pre_header';
import {Locations} from 'utils/constants';

jest.mock('utils/post_utils.jsx', () => ({
    isEdited: jest.fn().mockReturnValue(true),
    isSystemMessage: jest.fn().mockReturnValue(false),
    fromAutoResponder: jest.fn().mockReturnValue(false),
}));

describe('components/RhsRootPost', () => {
    const post = {
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
        type: '',
        update_at: 1502715372443,
        user_id: 'user_id',
    };
    const baseProps = {
        post,
        teamId: 'team_id',
        currentUserId: 'user_id',
        compactDisplay: true,
        commentCount: 0,
        author: 'Author',
        reactions: {},
        isFlagged: false,
        isBusy: false,
        previewCollapsed: '',
        previewEnabled: false,
        isEmbedVisible: false,
        enableEmojiPicker: true,
        enablePostUsernameOverride: false,
        isReadOnly: false,
        pluginPostTypes: {},
        channelIsArchived: false,
        channelType: 'O',
        channelDisplayName: 'Test',
        handleCardClick: jest.fn(),
        shortcutReactToLastPostEmittedFrom: '',
        actions: {
            markPostAsUnread: jest.fn(),
        },
        emojiMap: new EmojiMap(new Map()),
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <RhsRootPost {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when flagged', () => {
        const props = {
            ...baseProps,
            isFlagged: true,
        };
        const wrapper = shallowWithIntl(
            <RhsRootPost {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on deleted post', () => {
        const props = {
            ...baseProps,
            post: {
                ...baseProps.post,
                state: Posts.POST_DELETED,
            },
        };
        const wrapper = shallowWithIntl(
            <RhsRootPost {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot on flagged, deleted post', () => {
        const props = {
            ...baseProps,
            post: {
                ...baseProps.post,
                state: Posts.POST_DELETED,
                isFlagged: true,
            },
        };
        const wrapper = shallowWithIntl(
            <RhsRootPost {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should show pointer when alt is held down', () => {
        const wrapper = shallowWithIntl(
            <RhsRootPost {...baseProps}/>,
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
            <RhsRootPost {...props}/>,
        );

        expect(wrapper.find('.post.cursor--pointer').exists()).toBe(false);

        wrapper.setState({alt: true});

        expect(wrapper.find('.post.cursor--pointer').exists()).toBe(false);
    });

    test('should call markPostAsUnread when post is alt+clicked on', () => {
        const wrapper = shallowWithIntl(
            <RhsRootPost {...baseProps}/>,
        );

        wrapper.simulate('click', {altKey: false});

        expect(baseProps.actions.markPostAsUnread).not.toHaveBeenCalled();

        wrapper.simulate('click', {altKey: true});

        expect(baseProps.actions.markPostAsUnread).toHaveBeenCalled();
    });

    test('should not call markPostAsUnread when post is alt+clicked on when channel is archived', () => {
        const props = {
            ...baseProps,
            channelIsArchived: true,
        };

        const wrapper = shallowWithIntl(
            <RhsRootPost {...props}/>,
        );

        wrapper.simulate('click', {altKey: false});

        expect(props.actions.markPostAsUnread).not.toHaveBeenCalled();

        wrapper.simulate('click', {altKey: true});

        expect(props.actions.markPostAsUnread).not.toHaveBeenCalled();
    });

    test('should pass props correctly to PostFlagIcon', () => {
        const wrapper = shallowWithIntl(
            <RhsRootPost {...baseProps}/>,
        );

        const flagIcon = wrapper.find(PostFlagIcon);
        expect(flagIcon).toHaveLength(1);
        expect(flagIcon.prop('location')).toEqual(Locations.RHS_ROOT);
        expect(flagIcon.prop('postId')).toEqual(baseProps.post.id);
        expect(flagIcon.prop('isFlagged')).toEqual(baseProps.isFlagged);
    });

    test('should pass props correctly to PostPreHeader', () => {
        const wrapper = shallowWithIntl(
            <RhsRootPost {...baseProps}/>,
        );

        const postPreHeader = wrapper.find(PostPreHeader);
        expect(postPreHeader).toHaveLength(1);
        expect(postPreHeader.prop('isFlagged')).toEqual(baseProps.isFlagged);
        expect(postPreHeader.prop('isPinned')).toEqual(baseProps.post.is_pinned);
        expect(postPreHeader.prop('channelId')).toEqual(baseProps.post.channel_id);
    });
});
