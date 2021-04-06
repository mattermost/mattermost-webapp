// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Posts} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import RhsComment from 'components/rhs_comment/rhs_comment.jsx';
import EmojiMap from 'utils/emoji_map';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import PostPreHeader from 'components/post_view/post_pre_header';
import {Locations} from 'utils/constants';
import {isSystemMessage} from 'utils/post_utils';

jest.mock('utils/post_utils.jsx', () => ({
    isEdited: jest.fn().mockReturnValue(true),
    isSystemMessage: jest.fn().mockReturnValue(false),
    fromAutoResponder: jest.fn().mockReturnValue(false),
}));

import {isMobile} from 'utils/utils';
import UserProfile from '../user_profile';

jest.mock('utils/utils', () => ({
    isMobile: jest.fn(),
}));

describe('components/RhsComment', () => {
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
        },
        emojiMap: new EmojiMap(new Map()),
        isBot: false,
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
        isMobile.mockImplementation(() => true);
        const wrapper = shallowWithIntl(
            <RhsComment {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot hovered on deleted post', () => {
        const props = {
            ...baseProps,
            post: {
                ...baseProps.post,
                state: Posts.POST_DELETED,
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

    test('should pass props correctly to PostFlagIcon', () => {
        isMobile.mockImplementationOnce(() => false);

        const wrapper = shallowWithIntl(
            <RhsComment {...baseProps}/>,
        );

        const flagIcon = wrapper.find(PostFlagIcon);
        expect(flagIcon).toHaveLength(1);
        expect(flagIcon.prop('location')).toEqual(Locations.RHS_COMMENT);
        expect(flagIcon.prop('postId')).toEqual(baseProps.post.id);
        expect(flagIcon.prop('isFlagged')).toEqual(baseProps.isFlagged);
    });

    test('should pass props correctly to PostPreHeader', () => {
        const wrapper = shallowWithIntl(
            <RhsComment {...baseProps}/>,
        );

        const postPreHeader = wrapper.find(PostPreHeader);
        expect(postPreHeader).toHaveLength(1);
        expect(postPreHeader.prop('isFlagged')).toEqual(baseProps.isFlagged);
        expect(postPreHeader.prop('isPinned')).toEqual(baseProps.post.is_pinned);
        expect(postPreHeader.prop('channelId')).toEqual(baseProps.post.channel_id);
    });

    test('should pass props correctly to UserProfile when sender is Bot', () => {
        isSystemMessage.mockImplementationOnce(() => true);

        const props = {
            ...baseProps,
            isBot: true,
        };

        const wrapper = shallowWithIntl(
            <RhsComment {...props}/>,
        );

        const userProfile = wrapper.find(UserProfile);
        expect(userProfile).toHaveLength(1);
        expect(userProfile.prop('overwriteName')).toBeUndefined();
        expect(userProfile.prop('userId')).toEqual(props.post.user_id);

        const visibleMessage = wrapper.find('span[className="post__visibility"]');
        expect(visibleMessage).toHaveLength(1);
        expect(visibleMessage.prop('children')).toBeTruthy();
        expect(visibleMessage.prop('children').props).toBeTruthy();
        expect(visibleMessage.prop('children').props.id).toEqual('post_info.message.visible');
    });
});
